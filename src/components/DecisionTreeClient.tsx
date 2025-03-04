import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  DecisionNode,
  decisionTree,
  Edition,
  editions,
} from "@/data/licenseData";

interface TreeNodeData extends d3.HierarchyNode<DecisionNode> {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
}

interface DecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
}

// Client-side only component to prevent hydration mismatches with D3
const DecisionTreeClient: React.FC<DecisionTreeProps> = ({
  onEditionSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>("root");
  const [path, setPath] = useState<DecisionNode[]>([decisionTree.root]);
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showFullTree, setShowFullTree] = useState(false);

  // Размеры узлов и отступы
  const nodeWidth = 180;
  const nodeHeight = 80;
  const nodeRadius = 6;
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };

  // Установка isClient в true при монтировании компонента на стороне клиента
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Обработчик для изменения размеров контейнера
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Инициализация размеров
    updateDimensions();

    // Слушатель события изменения размера окна
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isClient]);

  // Функция для создания иерархической структуры дерева
  const createHierarchy = useCallback(() => {
    const rootNode = decisionTree.root;
    const hierarchy = d3.hierarchy(rootNode, (node) => {
      const children: DecisionNode[] = [];
      if (node.yes) {
        children.push(decisionTree[node.yes]);
      }
      if (node.no) {
        children.push(decisionTree[node.no]);
      }
      return children;
    });

    return hierarchy;
  }, []);

  // Обновление пути при изменении текущего узла
  useEffect(() => {
    const newPath = [decisionTree.root];
    let currentNode = decisionTree.root;

    while (currentNode.id !== currentNodeId) {
      if (
        currentNode.yes &&
        decisionTree[currentNode.yes].id === currentNodeId
      ) {
        currentNode = decisionTree[currentNode.yes];
        newPath.push(currentNode);
        break;
      } else if (
        currentNode.no &&
        decisionTree[currentNode.no].id === currentNodeId
      ) {
        currentNode = decisionTree[currentNode.no];
        newPath.push(currentNode);
        break;
      }

      // Поиск в глубину
      if (currentNode.yes) {
        const yesNode = decisionTree[currentNode.yes];
        const yesPath = findPathToNode(yesNode, currentNodeId);
        if (yesPath.length > 0) {
          newPath.push(...yesPath);
          break;
        }
      }

      if (currentNode.no) {
        const noNode = decisionTree[currentNode.no];
        const noPath = findPathToNode(noNode, currentNodeId);
        if (noPath.length > 0) {
          newPath.push(...noPath);
          break;
        }
      }

      break;
    }

    setPath(newPath);

    // Если текущий узел имеет результат, уведомляем родителя
    const selectedNode = decisionTree[currentNodeId];
    if (selectedNode.result) {
      const edition = editions.find((e) => e.id === selectedNode.result) || null;
      onEditionSelect(edition);
    } else {
      onEditionSelect(null);
    }
  }, [currentNodeId, onEditionSelect]);

  // Функция для нахождения пути от узла до целевого узла
  const findPathToNode = (
    startNode: DecisionNode,
    targetId: string
  ): DecisionNode[] => {
    if (startNode.id === targetId) {
      return [startNode];
    }

    if (startNode.yes) {
      const yesNode = decisionTree[startNode.yes];
      const path = findPathToNode(yesNode, targetId);
      if (path.length > 0) {
        return [startNode, ...path];
      }
    }

    if (startNode.no) {
      const noNode = decisionTree[startNode.no];
      const path = findPathToNode(noNode, targetId);
      if (path.length > 0) {
        return [startNode, ...path];
      }
    }

    return [];
  };

  // Отрисовка дерева решений
  useEffect(() => {
    try {
      // Базовые проверки на null для всех необходимых элементов
      if (!svgRef.current || !isClient || dimensions.width === 0) return;

      // Получаем выборки D3 безопасно
      const svgElement = d3.select(svgRef.current);
      svgElement.selectAll("*").remove();

      // Проверка валидности выборок D3
      if (!svgElement || !svgElement.node()) return;

      const hierarchy = createHierarchy();
      if (!hierarchy) return;

      // Создаем контейнер для зума и пана с учетом отступов
      const zoomG = svgElement
        .append("g")
        .attr("class", "zoom-container");

      // Создаем древовидную раскладку
      // Используем динамические размеры на основе количества узлов и размера экрана
      const maxDepth = getMaxDepth(hierarchy);
      const maxWidth = getMaxWidth(hierarchy);
      
      // Расчет размеров дерева на основе количества уровней и узлов
      const treeWidth = Math.max(dimensions.width - margin.left - margin.right, maxWidth * (nodeWidth * 1.8));
      const treeHeight = Math.max(dimensions.height - margin.top - margin.bottom, maxDepth * (nodeHeight * 1.8));

      // Настройка древовидной раскладки
      const treeLayout = d3
        .tree<DecisionNode>()
        .size([treeHeight, treeWidth])
        .nodeSize([nodeHeight * 1.5, nodeWidth * 1.8])
        .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

      const root = treeLayout(hierarchy);
      if (!root) return;

      // Создаем и настраиваем функционал зума
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => {
          zoomG.attr("transform", event.transform);
          setZoomLevel(event.transform.k);
        });

      // Применяем зум к SVG-элементу
      svgElement.call(zoom);

      // Добавляем стрелки для связей
      const defs = svgElement.append("defs");
      defs
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20) // Увеличили чтобы стрелка не перекрывала узел
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#6366f1");

      // Создаем группу для связей
      const links = zoomG.append("g").attr("class", "links");

      // Генератор связей
      const linkGenerator = d3
        .linkHorizontal<
          d3.HierarchyPointLink<DecisionNode>,
          d3.HierarchyPointNode<DecisionNode>
        >()
        .x((d) => d?.y || 0)
        .y((d) => d?.x || 0);

      // Добавляем связи
      links
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("class", "link")
        .attr("d", linkGenerator)
        .attr("fill", "none")
        .attr("stroke", "#a5b4fc")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      // Создаем группу для узлов
      const nodes = zoomG.append("g").attr("class", "nodes");

      // Создаем узлы
      const nodeElements = nodes
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .attr("cursor", "pointer")
        .on("click", (event, d) => {
          if (d && d.data) {
            event.stopPropagation();
            setCurrentNodeId(d.data.id);
            
            // Центрируем на выбранном узле
            if (!showFullTree) {
              centerNodeInView(d);
            }
          }
        });

      // Добавляем прямоугольники для узлов
      nodeElements
        .append("rect")
        .attr("class", "node-rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -nodeHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", (d) => {
          if (d.data.id === currentNodeId) {
            return "#4f46e5";
          }
          if (d.data.result) {
            return "#10b981";
          }
          return "#f3f4f6";
        })
        .attr("stroke", (d) => {
          if (d.data.id === currentNodeId) {
            return "#4338ca";
          }
          if (d.data.result) {
            return "#059669";
          }
          return "#d1d5db";
        })
        .attr("stroke-width", 2)
        .attr("filter", (d) => 
          d.data.id === currentNodeId 
            ? "drop-shadow(0 4px 6px rgba(79, 70, 229, 0.25))" 
            : "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))"
        );

      // Добавляем текст к узлам
      const nodeText = nodeElements
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", (d) => {
          if (d.data.id === currentNodeId || d.data.result) {
            return "#ffffff";
          }
          return "#1f2937";
        })
        .attr("font-size", "12px")
        .attr("font-weight", "medium")
        .attr("pointer-events", "none");

      // Разбиваем текст на строки
      nodeText.each(function (d) {
        const text = d3.select(this);
        const words = d.data.question?.split(" ") || [];
        let line = "";
        let lineNumber = 0;
        const lineHeight = 1.2;
        const width = nodeWidth - 24;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const tspan = text.append("tspan");
          
          tspan.text(testLine);
          const tspanNode = tspan.node();
          const textLength = tspanNode ? tspanNode.getComputedTextLength() : 0;
          tspan.remove();

          if (textLength > width && i > 0) {
            text
              .append("tspan")
              .attr("x", 0)
              .attr("dy", `${lineNumber === 0 ? -1 : lineHeight}em`)
              .text(line.trim());
            line = words[i] + " ";
            lineNumber++;
          } else {
            line = testLine;
          }
        }

        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", `${lineNumber === 0 ? -1 : lineHeight}em`)
          .text(line.trim());
      });

      // Добавляем метки "Да" и "Нет" к рёбрам
      zoomG
        .append("g")
        .selectAll("text")
        .data(root.links())
        .join("text")
        .attr("x", (d) => (d.source.y + d.target.y) / 2)
        .attr("y", (d) => (d.source.x + d.target.x) / 2 - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "#6366f1")
        .attr("class", "edge-label")
        .attr("pointer-events", "none")
        .text((d) => {
          if (!d.source.data || !d.target.data) return "";

          const sourceData = d.source.data;
          
          if (sourceData.yes && decisionTree[sourceData.yes].id === d.target.data.id) {
            return "Да";
          } 
          
          if (sourceData.no && decisionTree[sourceData.no].id === d.target.data.id) {
            return "Нет";
          }
          
          return "";
        })
        .each(function() {
          // Добавляем фон для лучшей видимости текста
          const textElement = d3.select(this);
          const bbox = (this as SVGTextElement).getBBox();
          const padding = 3;
          
          d3.select(this.parentNode)
            .insert("rect", "text")
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + (padding * 2))
            .attr("height", bbox.height + (padding * 2))
            .attr("rx", 3)
            .attr("fill", "white")
            .attr("fill-opacity", 0.8);
        });

      // Функция для центрирования выбранного узла
      function centerNodeInView(d: d3.HierarchyPointNode<DecisionNode>) {
        const scale = zoomLevel;
        const x = -d.y * scale + dimensions.width / 2;
        const y = -d.x * scale + dimensions.height / 2;
        
        svgElement
          .transition()
          .duration(500)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(x, y).scale(scale)
          );
      }

      // Если это первая визуализация или нужно показать полное дерево, центрируем корень
      if (!showFullTree) {
        // Находим текущий узел в иерархии
        const currentNode = root.descendants().find(d => d.data.id === currentNodeId);
        if (currentNode) {
          // Используем начальное масштабирование, чтобы видеть узел в контексте
          const initialScale = 0.8;
          const x = -currentNode.y * initialScale + dimensions.width / 2;
          const y = -currentNode.x * initialScale + dimensions.height / 2;
          
          // Устанавливаем начальную трансформацию с анимацией
          svgElement
            .transition()
            .duration(800)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(x, y).scale(initialScale)
            );
        }
      } else {
        // Если показываем полное дерево, подбираем масштаб, чтобы все дерево уместилось
        const nodesArray = root.descendants();
        const xMin = d3.min(nodesArray, d => d.y - nodeWidth/2) || 0;
        const xMax = d3.max(nodesArray, d => d.y + nodeWidth/2) || 0;
        const yMin = d3.min(nodesArray, d => d.x - nodeHeight/2) || 0;
        const yMax = d3.max(nodesArray, d => d.x + nodeHeight/2) || 0;
        
        const treeWidth = xMax - xMin + margin.left + margin.right;
        const treeHeight = yMax - yMin + margin.top + margin.bottom;
        
        const scaleX = dimensions.width / treeWidth;
        const scaleY = dimensions.height / treeHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        const x = -(xMin + xMax) / 2 * scale + dimensions.width / 2;
        const y = -(yMin + yMax) / 2 * scale + dimensions.height / 2;
        
        svgElement
          .transition()
          .duration(800)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(x, y).scale(scale)
          );
      }

    } catch (error) {
      console.error("Error rendering Decision Tree:", error);
    }
  }, [createHierarchy, currentNodeId, isClient, dimensions, showFullTree, zoomLevel]);

  // Функция для определения максимальной глубины дерева
  const getMaxDepth = (hierarchy: d3.HierarchyNode<DecisionNode>): number => {
    let maxDepth = 0;
    
    hierarchy.eachAfter(node => {
      maxDepth = Math.max(maxDepth, node.depth);
    });
    
    return maxDepth + 1; // +1 потому что глубина начинается с 0
  };

  // Функция для определения максимальной ширины уровня
  const getMaxWidth = (hierarchy: d3.HierarchyNode<DecisionNode>): number => {
    const levelWidths: number[] = [];
    
    hierarchy.eachBefore(node => {
      if (levelWidths[node.depth] === undefined) {
        levelWidths[node.depth] = 0;
      }
      levelWidths[node.depth]++;
    });
    
    return Math.max(...levelWidths);
  };

  const handleAnswerClick = (answer: "yes" | "no") => {
    const activeNode = decisionTree[currentNodeId];
    if (answer === "yes" && activeNode.yes) {
      setCurrentNodeId(decisionTree[activeNode.yes].id);
    } else if (answer === "no" && activeNode.no) {
      setCurrentNodeId(decisionTree[activeNode.no].id);
    }
  };

  const handleReset = () => {
    setCurrentNodeId("root");
    onEditionSelect(null);
  };

  const toggleFullTree = () => {
    setShowFullTree(prev => !prev);
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    
    svgElement
      .transition()
      .duration(300)
      .call(
        zoom.scaleBy, 
        1.2
      );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    
    svgElement
      .transition()
      .duration(300)
      .call(
        zoom.scaleBy, 
        0.8
      );
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    
    svgElement
      .transition()
      .duration(500)
      .call(
        zoom.transform,
        d3.zoomIdentity
      );
  };

  const currentNode = decisionTree[currentNodeId];
  const isEndNode = !!currentNode.result;

  return (
    <div className="flex flex-col space-y-4">
      {/* Панель навигации */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-xl font-bold mb-2">
          Проводник по выбору редакции DKP
        </h3>
        <div className="mb-4">
          <p className="text-gray-700">{currentNode?.question || ""}</p>
        </div>

        {!isEndNode && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAnswerClick("yes")}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm flex items-center"
              disabled={!currentNode.yes}
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Да
            </button>
            <button
              onClick={() => handleAnswerClick("no")}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm flex items-center"
              disabled={!currentNode.no}
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Нет
            </button>
          </div>
        )}

        {isEndNode && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Начать заново
          </button>
        )}
      </div>

      {/* Инструменты управления графом */}
      <div className="bg-white shadow rounded-lg p-3 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullTree}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              showFullTree 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              {showFullTree ? (
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              ) : (
                <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
              )}
            </svg>
            {showFullTree ? 'Фокусироваться на выбранном' : 'Показать все дерево'}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Уменьшить"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="text-sm font-medium text-gray-700">
            {Math.round(zoomLevel * 100)}%
          </div>
          
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Увеличить"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Сбросить масштаб"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Контейнер для визуализации дерева */}
      {isClient && (
        <div 
          ref={containerRef} 
          className="relative overflow-hidden bg-white shadow-lg rounded-lg border border-gray-200"
          style={{ height: '550px', width: '100%' }}
        >
          {/* Инструкция */}
          <div className="absolute top-3 right-3 bg-white bg-opacity-80 rounded-lg p-2 text-xs text-gray-600 shadow-sm border border-gray-200 z-10">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 mr-1 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Управление графом:</span>
            </div>
            <ul className="space-y-1 pl-2">
              <li>• Колесо мыши: масштабирование</li>
              <li>• Перетаскивание: перемещение</li>
              <li>• Клик по узлу: выбор варианта</li>
            </ul>
          </div>
          
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            className="font-sans"
          />
          
          {/* Легенда */}
          <div className="absolute bottom-3 left-3 bg-white bg-opacity-80 rounded-lg p-2 text-xs text-gray-600 shadow-sm border border-gray-200 flex items-center gap-3 z-10">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></div>
              <span>Вопрос</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 rounded mr-1"></div>
              <span>Текущий</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded mr-1"></div>
              <span>Результат</span>
            </div>
          </div>
        </div>
      )}

      {/* Путь навигации */}
      {path.length > 1 && (
        <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
          <div className="flex items-center space-x-2 text-sm">
            {path.map((node, index) => (
              <React.Fragment key={node.id}>
                <span 
                  onClick={() => setCurrentNodeId(node.id)}
                  className={`
                    cursor-pointer px-2 py-1 rounded
                    ${node.id === currentNodeId 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  {node.question.length > 30 
                    ? node.question.substring(0, 30) + '...' 
                    : node.question}
                </span>
                {index < path.length - 1 && (
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionTreeClient;
