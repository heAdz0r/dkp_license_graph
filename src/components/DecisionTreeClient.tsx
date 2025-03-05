import React, { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import {
  DecisionNode,
  decisionTree,
  Edition,
  editions,
} from "@/data/licenseData";
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Paper, 
  Typography,
  Chip
} from '@mui/material';

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
      <Box 
        sx={{ 
          p: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 550,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            fontWeight="medium" 
            sx={{ mb: 1 }}
          >
            Загрузка визуализации...
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
          >
            Подготовка интерактивной диаграммы
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Панель навигации */}
      <Paper
        variant="outlined"
        sx={{ p: 2, bgcolor: 'background.paper' }}
      >
        <Typography variant="h6" gutterBottom component="h3">
          Проводник по выбору редакции DKP
        </Typography>
        
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography>{currentNode?.question || ""}</Typography>
        </Box>

        {!isEndNode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAnswerClick("yes")}
              disabled={!currentNode.yes}
            >
              Да
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleAnswerClick("no")}
              disabled={!currentNode.no}
            >
              Нет
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleReset}
          >
            Начать заново
          </Button>
        )}
      </Paper>

      {/* Прогресс и панель инструментов */}
      <Paper
        variant="outlined"
        sx={{ 
          p: 0, 
          bgcolor: 'background.paper',
          overflow: 'hidden' 
        }}
      >
        {/* Индикатор прогресса */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс по дереву решений
            </Typography>
            <Chip 
              size="small" 
              color="primary" 
              label={isEndNode ? "Завершено" : `${Math.min(Math.round((path.length / 6) * 100), 99)}%`}
            />
          </Box>
          <Box
            sx={{
              height: 5,
              width: '100%',
              bgcolor: 'grey.100',
              borderRadius: 5,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: isEndNode ? '100%' : `${Math.min(Math.round((path.length / 6) * 100), 99)}%`,
                bgcolor: 'primary.main',
                borderRadius: 5,
                transition: 'width 0.5s ease'
              }}
            />
          </Box>
        </Box>

        {/* Элементы управления */}
        <Box 
          sx={{ 
            p: 1.5, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button
            size="small"
            variant={showFullTree ? "contained" : "outlined"}
            color="primary"
            onClick={toggleFullTree}
          >
            {showFullTree ? 'Фокус на выбранном' : 'Показать всё дерево'}
          </Button>

          <ButtonGroup size="small" variant="outlined">
            <Button onClick={handleZoomOut}>−</Button>
            <Button onClick={handleResetZoom}>
              {Math.round(zoomLevel * 100)}%
            </Button>
            <Button onClick={handleZoomIn}>+</Button>
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Контейнер для визуализации дерева */}
      <Box
        ref={containerRef}
        sx={{
          height: 500,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ fontFamily: 'inherit' }}
        />
        
        {/* Легенда */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            p: 1,
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                bgcolor: 'background.paper', 
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                mr: 0.5
              }} 
            />
            <Typography variant="caption">Вопрос</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                bgcolor: 'primary.main', 
                borderRadius: 0.5, 
                mr: 0.5 
              }} 
            />
            <Typography variant="caption">Текущий</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                bgcolor: 'success.main', 
                borderRadius: 0.5, 
                mr: 0.5 
              }} 
            />
            <Typography variant="caption">Результат</Typography>
          </Box>
        </Box>
      </Box>

      {/* Навигационные хлебные крошки */}
      {path.length > 1 && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1 }}>
            {path.map((node, index) => (
              <React.Fragment key={node.id}>
                <Chip
                  label={node.question.length > 20 ? node.question.substring(0, 20) + '...' : node.question}
                  size="small"
                  variant={node.id === currentNodeId ? "filled" : "outlined"}
                  color={node.id === currentNodeId ? "primary" : "default"}
                  onClick={() => setCurrentNodeId(node.id)}
                  clickable
                />
                {index < path.length - 1 && (
                  <Typography sx={{ color: 'text.disabled', mx: 0.5 }}>
                    /
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DecisionTreeClient;