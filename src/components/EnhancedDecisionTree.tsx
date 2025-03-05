import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  DecisionNode, 
  decisionTree, 
  Edition, 
  editions,
} from '@/data/licenseData';

interface TreeNodeData extends d3.HierarchyNode<DecisionNode> {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
}

interface TreeLinkData {
  source: TreeNodeData;
  target: TreeNodeData;
}

interface EnhancedDecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
  width?: number;
  height?: number;
}

// Размеры графа и настройки
const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_RADIUS = 6;
const MARGIN = { top: 30, right: 100, bottom: 30, left: 100 };
const ZOOM_DURATION = 500; // ms

const EnhancedDecisionTree: React.FC<EnhancedDecisionTreeProps> = ({
  onEditionSelect,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>("root");
  const [path, setPath] = useState<DecisionNode[]>([decisionTree.root]);
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState<d3.ZoomBehavior<Element, unknown> | null>(null);
  
  // Состояние для отслеживания текущего масштаба и позиции
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

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
      const edition =
        editions.find((e) => e.id === selectedNode.result) || null;
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

  // Set isClient to true when component mounts on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Функция для фокусировки на конкретном узле
  const focusNode = useCallback((nodeData: TreeNodeData) => {
    if (!svgRef.current || !zoom) return;
    
    // Получаем размеры SVG
    const svgWidth = svgRef.current.clientWidth || width;
    const svgHeight = svgRef.current.clientHeight || height;
    
    // Рассчитываем трансформацию для центрирования узла
    const scale = 1.2; // Масштаб увеличения
    const x = -(nodeData.y || 0) * scale + svgWidth / 2;
    const y = -(nodeData.x || 0) * scale + svgHeight / 2;
    
    // Анимированное перемещение к узлу
    d3.select(svgRef.current)
      .transition()
      .duration(ZOOM_DURATION)
      .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
      
    // Обновляем состояние трансформации
    setTransform({ k: scale, x, y });
  }, [zoom, width, height]);

  // Отрисовка дерева решений
  useEffect(() => {
    try {
      // Basic null checks to ensure all required elements are available
      if (!svgRef.current || !gRef.current || !isClient) return;

      // Safely get D3 selections
      const svgElement = d3.select(svgRef.current);
      const gElement = d3.select(gRef.current);

      // Verify D3 selections are valid
      if (!svgElement || !gElement || !svgElement.node() || !gElement.node())
        return;

      const hierarchy = createHierarchy();
      if (!hierarchy) return;

      // Очистка существующих элементов - safely
      if (gRef.current) {
        d3.select(gRef.current).selectAll("*").remove();
      } else {
        console.warn("gRef.current is null, skipping D3 update");
        return; // Exit the effect if gRef.current is null
      }

      // Создаем древовидную раскладку
      const treeLayout = d3
        .tree<DecisionNode>()
        .size([
          height - MARGIN.top - MARGIN.bottom,
          width - MARGIN.left - MARGIN.right - 160,
        ])
        .nodeSize([NODE_HEIGHT * 1.5, NODE_WIDTH * 1.5]);

      const root = treeLayout(hierarchy as d3.HierarchyNode<DecisionNode>);
      if (!root) return;

      // Настройка масштабирования (zoom)
      const zoomBehavior = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2]) // Минимальный и максимальный масштаб
        .on('zoom', (event) => {
          gElement.attr('transform', event.transform.toString());
          setTransform({ 
            k: event.transform.k, 
            x: event.transform.x, 
            y: event.transform.y 
          });
        });
      
      setZoom(zoomBehavior);
      
      svgElement.call(zoomBehavior)
        .on("dblclick.zoom", null); // Отключаем двойной клик для зума
      
      // Начальная трансформация
      svgElement.call(zoomBehavior.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.8));

      // Добавляем маркер стрелки для связей
      svgElement
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");

      // Отображаем линии
      const linkGenerator = d3
        .linkHorizontal<
          d3.HierarchyPointLink<DecisionNode>,
          d3.HierarchyPointNode<DecisionNode>
        >()
        .x((d) => d?.y || 0)
        .y((d) => d?.x || 0);

      const links = gElement.append("g");

      if (!links.empty()) {
        links
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 2)
          .selectAll("path")
          .data(root.links())
          .join("path")
          .attr("d", linkGenerator as any)
          .attr("marker-end", "url(#arrow)")
          .attr("class", "link transition-all duration-300");
      }

      // Отображаем узлы
      const nodeGroup = gElement.append("g");
      if (nodeGroup.empty()) return;

      const node = nodeGroup
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", (d) => {
          return `translate(${d?.y || 0},${d?.x || 0})`;
        })
        .attr("cursor", "pointer")
        .attr("class", "node")
        .on("click", (event, d) => {
          if (d && d.data) {
            event.stopPropagation();
            setCurrentNodeId(d.data.id);
            focusNode(d as TreeNodeData);
          }
        });

      // Прямоугольники для узлов
      if (node && !node.empty()) {
        node
          .append("rect")
          .attr("x", -NODE_WIDTH / 2)
          .attr("y", -NODE_HEIGHT / 2)
          .attr("width", NODE_WIDTH)
          .attr("height", NODE_HEIGHT)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", (d) => {
            if (d && d.data && d.data.id === currentNodeId) {
              return "#4f46e5";
            }
            if (d && d.data && d.data.result) {
              return "#10b981";
            }
            return "#f3f4f6";
          })
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 1)
          .attr("class", "node-rect transition-all duration-300");
      }

      // Текст для узлов
      if (node && !node.empty()) {
        node
          .append("text")
          .attr("dy", "0.32em")
          .attr("text-anchor", "middle")
          .attr("fill", (d) => {
            // Safe property access with null checks
            if (d && d.data && (d.data.id === currentNodeId || d.data.result)) {
              return "#ffffff";
            }
            return "#1f2937";
          })
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .each(function (d) {
            try {
              if (!d || !d.data || !d.data.question) return;

              const text = d3.select(this);
              if (!text || text.empty()) return;

              const words = d.data.question.split(" ");
              let line = "";
              let lineNumber = 0;
              const lineHeight = 1.1;
              const y = 0;
              const x = 0;
              const width = NODE_WIDTH - 20;

              for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = line + word + " ";
                const testElem = text.append("tspan").text(testLine);

                // Safely check if testElem exists and has a node
                if (testElem.empty()) {
                  line = testLine;
                  continue;
                }

                const testNode = testElem.node();
                const testWidth = testNode
                  ? (testNode as SVGTSpanElement).getComputedTextLength() || 0
                  : 0;
                testElem.remove();

                if (testWidth > width && i > 0) {
                  const tspan = text.append("tspan");
                  if (!tspan.empty()) {
                    tspan
                      .attr("x", x)
                      .attr("y", y)
                      .attr("dy", `${lineNumber * lineHeight}em`)
                      .text(line);
                  }
                  line = word + " ";
                  lineNumber++;
                } else {
                  line = testLine;
                }
              }

              const finalTspan = text.append("tspan");
              if (!finalTspan.empty()) {
                finalTspan
                  .attr("x", x)
                  .attr("y", y)
                  .attr("dy", `${lineNumber * lineHeight}em`)
                  .text(line);
              }

              // Центрирование текста по вертикали
              const textHeight = lineNumber * lineHeight;
              const tspans = text.selectAll("tspan");
              if (!tspans.empty()) {
                tspans.attr(
                  "dy",
                  (d, i) => `${i * lineHeight - textHeight / 2 + 0.32}em`
                );
              }
            } catch (err) {
              console.error("Error rendering text for node:", err);
            }
          });
      }

      // Добавляем метки "Да" и "Нет" к ребрам
      if (gRef.current) {
        d3.select(gRef.current)
          .append("g")
          .selectAll("text")
          .data(root.links())
          .join("text")
          .attr("x", (d) => (d.source.y + d.target.y) / 2)
          .attr("y", (d) => (d.source.x + d.target.x) / 2 - 8)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text((d) => {
            if (
              !d ||
              !d.source ||
              !d.source.data ||
              !d.target ||
              !d.target.data
            ) {
              return "";
            }

            const sourceData = d.source.data;
            const targetData = d.target.data;

            if (
              sourceData.yes &&
              decisionTree[sourceData.yes].id === targetData.id
            ) {
              return "Да";
            } else if (
              sourceData.no &&
              decisionTree[sourceData.no].id === targetData.id
            ) {
              return "Нет";
            }
            return "";
          })
          .attr("class", "edge-label");
      }

      // Добавляем эффект выделения для активного узла
      const activeNodeId = currentNodeId;
      nodeGroup.selectAll("g").each(function(d: any) {
        if (d.data.id === activeNodeId) {
          d3.select(this).raise(); // Поднимаем активный узел наверх
          d3.select(this).select("rect")
            .attr("filter", "drop-shadow(0 0 5px rgba(79, 70, 229, 0.5))");
        }
      });

      // Фокусируем на активном узле
      const activeNode = root.descendants().find(d => d.data.id === activeNodeId);
      if (activeNode) {
        setTimeout(() => {
          focusNode(activeNode as TreeNodeData);
        }, 100);
      }

    } catch (error) {
      console.error("Error rendering Decision Tree:", error);
    }
  }, [createHierarchy, currentNodeId, isClient, width, height, focusNode]);

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
    
    // Сбрасываем зум
    if (svgRef.current && zoom) {
      d3.select(svgRef.current)
        .transition()
        .duration(ZOOM_DURATION)
        .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(0.8));
    }
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoom) {
      d3.select(svgRef.current)
        .transition()
        .duration(200)
        .call(zoom.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoom) {
      d3.select(svgRef.current)
        .transition()
        .duration(200)
        .call(zoom.scaleBy, 0.8);
    }
  };

  const handleResetView = () => {
    if (svgRef.current && zoom) {
      d3.select(svgRef.current)
        .transition()
        .duration(ZOOM_DURATION)
        .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(0.8));
    }
  };

  const currentNode = decisionTree[currentNodeId];
  const isEndNode = !!currentNode.result;
  
  return (
    <div className="flex flex-col">
      <div className="mb-4 p-4 bg-white shadow rounded-lg">
        <h3 className="text-xl font-bold mb-2">
          Проводник по выбору редакции DKP
        </h3>
        <div className="mb-4">
          <p className="text-gray-700">{currentNode?.question || ""}</p>
        </div>

        {!isEndNode && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswerClick("yes")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!currentNode.yes}
            >
              Да
            </button>
            <button
              onClick={() => handleAnswerClick("no")}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={!currentNode.no}
            >
              Нет
            </button>
          </div>
        )}

        {isEndNode && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Начать заново
          </button>
        )}
      </div>

      {/* Only render the SVG visualization on client-side */}
      {isClient && (
        <div className="relative overflow-hidden bg-white shadow-lg rounded-lg p-4">
          {/* Контроллеры масштабирования */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded shadow p-1">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Увеличить"
            >
              <svg className="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Уменьшить"
            >
              <svg className="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <button
              onClick={handleResetView}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Сбросить вид"
            >
              <svg className="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
          
          {/* Легенда */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 rounded-md shadow-md p-2 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
              <span>Текущий вопрос</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500"></div>
              <span>Результат</span>
            </div>
          </div>
          
          <svg 
            ref={svgRef} 
            width={width} 
            height={height} 
            className="mx-auto cursor-move transition-all duration-300 ease-out bg-gray-50"
          >
            <g
              ref={gRef}
              transform={`translate(${MARGIN.left},${MARGIN.top})`}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default EnhancedDecisionTree;
