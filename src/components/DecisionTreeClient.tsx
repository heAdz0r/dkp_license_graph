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

interface TreeLinkData {
  source: TreeNodeData;
  target: TreeNodeData;
}

interface DecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
}

// Размеры графа
const width = 900;
const height = 600;
const nodeWidth = 200;
const nodeHeight = 80;
const nodeRadius = 6;
const margin = { top: 20, right: 120, bottom: 20, left: 120 };

// Client-side only component to prevent hydration mismatches with D3
const DecisionTreeClient: React.FC<DecisionTreeProps> = ({
  onEditionSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>("root");
  const [path, setPath] = useState<DecisionNode[]>([decisionTree.root]);
  const [isClient, setIsClient] = useState(false);

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
        // Проверка на null перед использованием gRef.current
        d3.select(gRef.current).selectAll("*").remove();
      } else {
        console.warn("gRef.current is null, skipping D3 update");
        return; // Exit the effect if gRef.current is null
      }

      // Создаем древовидную раскладку
      const treeLayout = d3
        .tree<DecisionNode>()
        .size([
          height - margin.top - margin.bottom,
          width - margin.left - margin.right - 160,
        ])
        .nodeSize([nodeHeight * 1.5, nodeWidth * 1.5]);

      const root = treeLayout(hierarchy as d3.HierarchyNode<DecisionNode>);
      if (!root) return;

      // Отображаем линии
      const linkGenerator = d3
        .linkHorizontal<
          d3.HierarchyPointLink<DecisionNode>,
          d3.HierarchyPointNode<DecisionNode>
        >()
        .x((d) => d?.y || 0)
        .y((d) => d?.x || 0);

      // Use the gElement selection instead of gRef.current directly
      const links = gElement.append("g");

      // Check if links was created successfully
      if (!links.empty()) {
        links
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 2)
          .selectAll("path")
          .data(root.links())
          .join("path")
          .attr("d", linkGenerator as any)
          .attr("marker-end", "url(#arrow)");
      }

      // Отображаем узлы - safely using the gElement selection
      const nodeGroup = gElement.append("g");
      if (nodeGroup.empty()) return;

      const node = nodeGroup
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", (d) => {
          // Safely access properties with optional chaining
          return `translate(${d?.y || 0},${d?.x || 0})`;
        })
        .attr("cursor", "pointer")
        .on("click", (event, d) => {
          if (d && d.data) {
            setCurrentNodeId(d.data.id);
          }
        });

      // Прямоугольники для узлов
      if (node && !node.empty()) {
        node
          .append("rect")
          .attr("x", -nodeWidth / 2)
          .attr("y", -nodeHeight / 2)
          .attr("width", nodeWidth)
          .attr("height", nodeHeight)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", (d) => {
            // Safe property access with null checks
            if (d && d.data && d.data.id === currentNodeId) {
              return "#4f46e5";
            }
            if (d && d.data && d.data.result) {
              return "#10b981";
            }
            return "#f3f4f6";
          })
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 1);
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
              const width = nodeWidth - 20;

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
        // Проверка на null перед использованием gRef.current
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
            // Safe property access for link labels
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
          });
      } else {
        console.warn("gRef.current is null, skipping link labels");
      }

      // Добавляем указатель к стрелкам
      if (svgRef.current) {
        // Проверка на null перед использованием svgRef.current
        d3.select(svgRef.current)
          .append("defs")
          .append("marker")
          .attr("id", "arrow")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 5)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "#999");
      } else {
        console.warn("svgRef.current is null, skipping arrow marker");
      }
    } catch (error) {
      console.error("Error rendering Decision Tree:", error);
    }
  }, [createHierarchy, currentNodeId, isClient]); // Add isClient to dependencies

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

  const currentNode = decisionTree[currentNodeId];
  const isEndNode = !!currentNode.result;
  // Don't render SVG visualization on server-side to prevent hydration mismatches
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
        <div className="overflow-auto bg-white shadow-lg rounded-lg p-4">
          <svg ref={svgRef} width={width} height={height} className="mx-auto">
            <g
              ref={gRef}
              transform={`translate(${margin.left},${margin.top})`}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DecisionTreeClient;
