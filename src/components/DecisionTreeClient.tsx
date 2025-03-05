import React, { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";
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
  const [loading, setLoading] = useState(true);

  // Размеры узлов и отступы
  const nodeWidth = 180;
  const nodeHeight = 80;
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  
  // Цветовая схема
  const colors = {
    node: {
      default: { bg: "#f8fafc", border: "#e2e8f0" },
      active: { bg: "#4f46e5", border: "#4338ca", text: "#ffffff" },
      result: { bg: "#10b981", border: "#059669", text: "#ffffff" }
    },
    link: { 
      default: "#cbd5e1", 
      active: "#6366f1"
    }
  };

  // Установка isClient в true при монтировании компонента на стороне клиента
  useEffect(() => {
    setIsClient(true);
    // Имитация загрузки данных для отображения лоадера
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Обработчик для изменения размеров контейнера
  useLayoutEffect(() => {
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

    const findPath = (node: DecisionNode, targetId: string, path: DecisionNode[] = []): DecisionNode[] | null => {
      if (node.id === targetId) {
        return [...path, node];
      }

      if (node.yes) {
        const yesNode = decisionTree[node.yes];
        const yesPaths = findPath(yesNode, targetId, [...path, node]);
        if (yesPaths) return yesPaths;
      }

      if (node.no) {
        const noNode = decisionTree[node.no];
        const noPaths = findPath(noNode, targetId, [...path, node]);
        if (noPaths) return noPaths;
      }

      return null;
    };

    // Если текущий узел не корневой, находим путь к нему
    if (currentNodeId !== 'root') {
      const foundPath = findPath(decisionTree.root, currentNodeId);
      if (foundPath) {
        setPath(foundPath);
      }
    } else {
      setPath([decisionTree.root]);
    }

    // Если текущий узел имеет результат, уведомляем родителя
    const selectedNode = decisionTree[currentNodeId];
    if (selectedNode.result) {
      const edition = editions.find((e) => e.id === selectedNode.result) || null;
      onEditionSelect(edition);
    } else {
      onEditionSelect(null);
    }
  }, [currentNodeId, onEditionSelect]);

  // Отрисовка дерева решений
  useEffect(() => {
    if (!svgRef.current || !isClient || dimensions.width === 0 || loading) return;

    try {
      // Получаем выборки D3 безопасно
      const svgElement = d3.select(svgRef.current);
      svgElement.selectAll("*").remove();

      const hierarchy = createHierarchy();
      if (!hierarchy) return;

      // Создаем контейнер для зума и пана с учетом отступов
      const zoomG = svgElement
        .append("g")
        .attr("class", "zoom-container");

      // Расчет размеров дерева на основе количества уровней и узлов
      const maxDepth = getTreeDepth(hierarchy);
      const maxWidth = getMaxLevelWidth(hierarchy);
      
      // Расчет идеальных размеров для дерева
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

      // Добавляем фильтр для тени
      const defs = svgElement.append("defs");
      
      // Фильтр для обычной тени
      defs.append("filter")
        .attr("id", "shadow")
        .attr("x", "-20%")
        .attr("y", "-20%")
        .attr("width", "140%")
        .attr("height", "140%")
        .append("feDropShadow")
        .attr("dx", "0")
        .attr("dy", "2")
        .attr("stdDeviation", "3")
        .attr("flood-opacity", "0.15");
      
      // Фильтр для активной тени
      defs.append("filter")
        .attr("id", "active-shadow")
        .attr("x", "-20%")
        .attr("y", "-20%")
        .attr("width", "140%")
        .attr("height", "140%")
        .append("feDropShadow")
        .attr("dx", "0")
        .attr("dy", "4")
        .attr("stdDeviation", "5")
        .attr("flood-color", "#4338ca")
        .attr("flood-opacity", "0.25");

      // Добавляем стрелки для связей
      defs.append("marker")
        .attr("id", "arrow-yes")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", colors.link.active);
      
      defs.append("marker")
        .attr("id", "arrow-no")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", colors.link.active);

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
        .attr("stroke", (d) => {
          // Находим текущий путь для подсветки
          const sourcePath = path.find(p => p.id === d.source.data.id);
          const targetPath = path.find(p => p.id === d.target.data.id);
          
          // Если оба узла в пути, подсвечиваем связь
          if (sourcePath && targetPath) {
            return colors.link.active;
          }
          return colors.link.default;
        })
        .attr("stroke-width", (d) => {
          // Находим текущий путь для подсветки
          const sourcePath = path.find(p => p.id === d.source.data.id);
          const targetPath = path.find(p => p.id === d.target.data.id);
          
          // Если оба узла в пути, делаем связь толще
          if (sourcePath && targetPath) {
            return 2.5;
          }
          return 1.5;
        })
        .attr("stroke-dasharray", (d) => {
          if (!d.source.data || !d.target.data) return null;
          
          const sourceData = d.source.data;
          // Для 'Нет' связей делаем пунктир
          if (sourceData.no && decisionTree[sourceData.no].id === d.target.data.id) {
            return "4,4";
          }
          return null;
        })
        .attr("marker-end", (d) => {
          if (!d.source.data || !d.target.data) return null;
          
          const sourceData = d.source.data;
          
          if (sourceData.yes && decisionTree[sourceData.yes].id === d.target.data.id) {
            return "url(#arrow-yes)";
          } 
          
          if (sourceData.no && decisionTree[sourceData.no].id === d.target.data.id) {
            return "url(#arrow-no)";
          }
          
          return null;
        });

      // Создаем группу для узлов
      const nodes = zoomG.append("g").attr("class", "nodes");

      // Создаем узлы
      const nodeElements = nodes
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("id", d => `node-${d.data.id}`)
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
          // Если узел в текущем пути, подсвечиваем его
          const isInPath = path.find(p => p.id === d.data.id);
          
          if (d.data.id === currentNodeId) {
            return colors.node.active.bg;
          }
          if (d.data.result) {
            return colors.node.result.bg;
          }
          return isInPath ? "#f1f5f9" : colors.node.default.bg;
        })
        .attr("stroke", (d) => {
          // Если узел в текущем пути, используем другой цвет границы
          const isInPath = path.find(p => p.id === d.data.id);
          
          if (d.data.id === currentNodeId) {
            return colors.node.active.border;
          }
          if (d.data.result) {
            return colors.node.result.border;
          }
          return isInPath ? "#94a3b8" : colors.node.default.border;
        })
        .attr("stroke-width", (d) => {
          // Текущий узел или результат имеют более толстую границу
          if (d.data.id === currentNodeId || d.data.result) {
            return 2;
          }
          return 1;
        })
        .attr("filter", (d) => {
          // Активный узел имеет свечение, остальные - обычную тень
          if (d.data.id === currentNodeId) {
            return "url(#active-shadow)";
          } 
          return "url(#shadow)";
        })
        .attr("opacity", (d) => {
          // Снижаем непрозрачность для узлов не в текущем пути, если показываем все дерево
          const isInPath = path.find(p => p.id === d.data.id);
          
          if (showFullTree && !isInPath && d.data.id !== currentNodeId) {
            return 0.7;
          }
          return 1;
        });

      // Добавляем текст к узлам
      const nodeText = nodeElements
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", (d) => {
          if (d.data.id === currentNodeId || d.data.result) {
            return colors.node.active.text;
          }
          return "#334155";
        })
        .attr("font-size", "12px")
        .attr("font-weight", (d) => d.data.id === currentNodeId ? "600" : "500")
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

      // Добавляем метки "Да" и "Нет" к рёбрам с улучшенным стилем
      zoomG
        .append("g")
        .selectAll("g")
        .data(root.links())
        .join("g")
        .attr("class", "edge-label")
        .attr("transform", (d) => {
          // Позиционируем метку на середине связи
          const midX = (d.source.y + d.target.y) / 2;
          const midY = (d.source.x + d.target.x) / 2;
          
          // Немного смещаем метку выше линии
          return `translate(${midX}, ${midY - 8})`;
        })
        .each(function(d) {
          // Пропускаем, если нет данных для источника или цели
          if (!d.source.data || !d.target.data) return;
          
          const sourceData = d.source.data;
          const group = d3.select(this);
          const isYesPath = sourceData.yes && decisionTree[sourceData.yes].id === d.target.data.id;
          const isNoPath = sourceData.no && decisionTree[sourceData.no].id === d.target.data.id;
          
          // Определяем, активна ли текущая связь (входит в путь)
          const sourcePath = path.find(p => p.id === d.source.data.id);
          const targetPath = path.find(p => p.id === d.target.data.id);
          const isActive = sourcePath && targetPath;
          
          // Определяем метку и стиль
          let labelText = "";
          let bgColor = "#f8fafc";
          let textColor = "#64748b";
          
          if (isYesPath) {
            labelText = "Да";
            if (isActive) {
              bgColor = "#c7d2fe";
              textColor = "#4338ca";
            }
          } else if (isNoPath) {
            labelText = "Нет";
            if (isActive) {
              bgColor = "#c7d2fe";
              textColor = "#4338ca";
            }
          }
          
          // Если нет текста, не создаем элементы
          if (!labelText) return;
          
          // Создаем фон и текст
          group.append("rect")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", bgColor)
            .attr("stroke", isActive ? "#a5b4fc" : "#e2e8f0")
            .attr("stroke-width", 1)
            .attr("opacity", 0.95);
          
          const text = group.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-weight", isActive ? "600" : "500")
            .attr("fill", textColor)
            .attr("dy", "0.32em")
            .text(labelText);
            
          // Получаем размеры текста для подгонки фона
          const bbox = text.node()?.getBBox();
          if (bbox) {
            group.select("rect")
              .attr("x", bbox.x - 6)
              .attr("y", bbox.y - 4)
              .attr("width", bbox.width + 12)
              .attr("height", bbox.height + 8);
          }
        });

      // Добавляем индикаторы для узлов с детьми в полноэкранном режиме
      if (showFullTree) {
        nodeElements
          .filter(d => d.children && d.children.length > 0)
          .append("circle")
          .attr("cx", nodeWidth / 2 - 10)
          .attr("cy", -nodeHeight / 2 + 10)
          .attr("r", 6)
          .attr("fill", "#f8fafc")
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 1);

        nodeElements
          .filter(d => d.children && d.children.length > 0)
          .append("text")
          .attr("x", nodeWidth / 2 - 10)
          .attr("y", -nodeHeight / 2 + 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .attr("fill", "#64748b")
          .text(d => d.children ? d.children.length : 0);
      }

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

      // Анимация начальной загрузки
      const initialSetup = () => {
        // Находим текущий узел в иерархии
        const currentNode = root.descendants().find(d => d.data.id === currentNodeId);
        
        if (showFullTree) {
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
        } else if (currentNode) {
          // Если есть текущий узел, центрируем на нем
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
        } else {
          // Центрируем на корне, если текущий узел не найден
          const rootNode = root.descendants()[0];
          const initialScale = 0.8;
          const x = -rootNode.y * initialScale + dimensions.width / 2;
          const y = -rootNode.x * initialScale + dimensions.height / 2;
          
          svgElement
            .transition()
            .duration(800)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(x, y).scale(initialScale)
            );
        }
      };

      // Выполняем начальную установку с небольшой задержкой для анимации
      setTimeout(initialSetup, 100);

    } catch (error) {
      console.error("Error rendering Decision Tree:", error);
    }
  }, [createHierarchy, currentNodeId, isClient, dimensions, showFullTree, zoomLevel, path, loading]);

  // Функция для определения максимальной глубины дерева
  const getTreeDepth = (hierarchy: d3.HierarchyNode<DecisionNode>): number => {
    let maxDepth = 0;
    
    hierarchy.eachAfter(node => {
      maxDepth = Math.max(maxDepth, node.depth);
    });
    
    return maxDepth + 1; // +1 потому что глубина начинается с 0
  };

  // Функция для определения максимальной ширины уровня
  const getMaxLevelWidth = (hierarchy: d3.HierarchyNode<DecisionNode>): number => {
    const levelWidths: number[] = [];
    
    hierarchy.eachBefore(node => {
      if (levelWidths[node.depth] === undefined) {
        levelWidths[node.depth] = 0;
      }
      levelWidths[node.depth]++;
    });
    
    return Math.max(...levelWidths);
  };

  // Обработчики ответов
  const handleAnswerClick = (answer: "yes" | "no") => {
    const activeNode = decisionTree[currentNodeId];
    if (answer === "yes" && activeNode.yes) {
      setCurrentNodeId(decisionTree[activeNode.yes].id);
    } else if (answer === "no" && activeNode.no) {
      setCurrentNodeId(decisionTree[activeNode.no].id);
    }
  };

  // Сброс до начального состояния
  const handleReset = () => {
    setCurrentNodeId("root");
    onEditionSelect(null);
  };

  // Переключение между режимами отображения
  const toggleFullTree = () => {
    setShowFullTree(prev => !prev);
  };

  // Управление масштабированием
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

  // Показываем индикатор загрузки, пока не готовы данные
  if (loading || !isClient) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="bg-white shadow rounded-lg p-4 animate-pulse">
          <div className="h-7 bg-gray-200 rounded mb-3 w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded mb-4 w-full"></div>
          
          <div className="flex space-x-3 mb-4">
            <div className="h-9 bg-green-200 rounded w-24"></div>
            <div className="h-9 bg-red-200 rounded w-24"></div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-3 animate-pulse">
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        <div className="relative bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden animate-pulse" style={{ height: '500px' }}>
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-indigo-500 mb-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-indigo-700 font-medium">
                Визуализация дерева решений...
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Подготовка интерактивной диаграммы
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Панель навигации */}
      <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-gray-800">
          Проводник по выбору редакции DKP
        </h3>
        <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-700">{currentNode?.question || ""}</p>
        </div>

        {!isEndNode ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAnswerClick("yes")}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm flex items-center"
              disabled={!currentNode.yes}
            >
              <svg className="w-5 h-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Да
            </button>
            <button
              onClick={() => handleAnswerClick("no")}
              className="px-4 py-2.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors shadow-sm flex items-center"
              disabled={!currentNode.no}
            >
              <svg className="w-5 h-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Нет
            </button>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Начать заново
          </button>
        )}
      </div>

      {/* Панель инструментов с прогрессом */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-100 border border-gray-100">
        {/* Строка прогресса */}
        <div className="px-5 py-3">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1.5">
            <span className="font-medium">Прогресс по дереву решений</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
              {isEndNode ? "Завершено" : `${Math.min(Math.round((path.length / 6) * 100), 99)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: isEndNode ? "100%" : `${Math.min(Math.round((path.length / 6) * 100), 99)}%` }}
            />
          </div>
        </div>

        {/* Панель управления визуализацией */}
        <div className="p-3 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullTree}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                showFullTree 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                {showFullTree ? (
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                ) : (
                  <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                )}
              </svg>
              {showFullTree ? 'Фокус на выбранном' : 'Показать всё дерево'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="Уменьшить"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="text-sm font-medium text-gray-700 w-16 text-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="Увеличить"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="Сбросить масштаб"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Контейнер для визуализации дерева */}
      <div 
        ref={containerRef} 
        className="relative overflow-hidden bg-white shadow-lg rounded-lg border border-gray-200"
        style={{ height: '550px', width: '100%' }}
      >
        {/* Инструкция */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-lg p-2.5 text-xs text-gray-600 shadow-sm border border-gray-200 z-10">
          <div className="flex items-center mb-1.5">
            <svg className="w-4 h-4 mr-1.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-700">Управление графом:</span>
          </div>
          <ul className="space-y-1.5 pl-2">
            <li className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>Колесо мыши: масштабирование</span>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>Перетаскивание: перемещение графа</span>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              <span>Клик по узлу: выбор варианта</span>
            </li>
          </ul>
        </div>
        
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="font-sans"
        />
        
        {/* Легенда */}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-lg p-2.5 text-xs shadow-sm border border-gray-200 flex items-center gap-4 z-10">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded mr-1.5"></div>
            <span className="text-gray-700">Вопрос</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-600 rounded mr-1.5"></div>
            <span className="text-gray-700">Текущий</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-600 rounded mr-1.5"></div>
            <span className="text-gray-700">Результат</span>
          </div>
        </div>
      </div>

      {/* Путь навигации */}
      {path.length > 1 && (
        <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto border border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            {path.map((node, index) => (
              <React.Fragment key={node.id}>
                <span 
                  onClick={() => setCurrentNodeId(node.id)}
                  className={`
                    cursor-pointer px-2 py-1 rounded
                    ${node.id === currentNodeId 
                      ? 'bg-indigo-100 text-indigo-700 font-medium border border-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent'}
                  `}
                >
                  {node.question.length > 30 
                    ? node.question.substring(0, 30) + '...' 
                    : node.question}
                </span>
                {index < path.length - 1 && (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
