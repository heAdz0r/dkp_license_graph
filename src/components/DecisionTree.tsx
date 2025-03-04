import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DecisionNode, decisionTree, Edition, editions } from '@/data/licenseData';

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

const DecisionTree: React.FC<DecisionTreeProps> = ({ onEditionSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [path, setPath] = useState<DecisionNode[]>([decisionTree.root]);

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
      if (currentNode.yes && decisionTree[currentNode.yes].id === currentNodeId) {
        currentNode = decisionTree[currentNode.yes];
        newPath.push(currentNode);
        break;
      } else if (currentNode.no && decisionTree[currentNode.no].id === currentNodeId) {
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
    const currentNode = decisionTree[currentNodeId];
    if (currentNode.result) {
      const edition = editions.find(e => e.id === currentNode.result) || null;
      onEditionSelect(edition);
    } else {
      onEditionSelect(null);
    }
  }, [currentNodeId, onEditionSelect]);

  // Функция для нахождения пути от узла до целевого узла
  const findPathToNode = (startNode: DecisionNode, targetId: string): DecisionNode[] => {
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
    if (!svgRef.current || !gRef.current) return;

    const hierarchy = createHierarchy();
    
    // Очистка существующих элементов
    d3.select(gRef.current).selectAll('*').remove();
    
    // Создаем древовидную раскладку
    const treeLayout = d3.tree<DecisionNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right - 160])
      .nodeSize([nodeHeight * 1.5, nodeWidth * 1.5]);
    
    const root = treeLayout(hierarchy as d3.HierarchyNode<DecisionNode>);
    
    // Отображаем линии
    const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<DecisionNode>, d3.HierarchyPointNode<DecisionNode>>()
      .x(d => d.y)
      .y(d => d.x);
      
    const links = gRef.current.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', linkGenerator as any)
      .attr('marker-end', 'url(#arrow)');
    
    // Отображаем узлы
    const node = gRef.current.append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        setCurrentNodeId(d.data.id);
      });
    
    // Прямоугольники для узлов
    node.append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', d => {
        if (d.data.id === currentNodeId) {
          return '#4f46e5';
        }
        if (d.data.result) {
          return '#10b981';
        }
        return '#f3f4f6';
      })
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1);
    
    // Текст для узлов
    node.append('text')
      .attr('dy', '0.32em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        if (d.data.id === currentNodeId || d.data.result) {
          return '#ffffff';
        }
        return '#1f2937';
      })
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .each(function(d) {
        const text = d3.select(this);
        const words = d.data.question.split(' ');
        let line = '';
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = 0;
        const x = 0;
        const width = nodeWidth - 20;
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = line + word + ' ';
          const testElem = text.append('tspan').text(testLine);
          const testWidth = (testElem.node() as SVGTSpanElement)?.getComputedTextLength() || 0;
          testElem.remove();
          
          if (testWidth > width && i > 0) {
            text.append('tspan')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', `${lineNumber * lineHeight}em`)
              .text(line);
            line = word + ' ';
            lineNumber++;
          } else {
            line = testLine;
          }
        }
        
        text.append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', `${lineNumber * lineHeight}em`)
          .text(line);
        
        // Центрирование текста по вертикали
        const textHeight = lineNumber * lineHeight;
        text.selectAll('tspan')
          .attr('dy', (d, i) => `${i * lineHeight - textHeight/2 + 0.32}em`);
      });
    
    // Добавляем метки "Да" и "Нет" к ребрам
    gRef.current.append('g')
      .selectAll('text')
      .data(root.links())
      .join('text')
      .attr('x', d => (d.source.y + d.target.y) / 2)
      .attr('y', d => (d.source.x + d.target.x) / 2 - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text(d => {
        const sourceData = d.source.data;
        const targetData = d.target.data;
        
        if (sourceData.yes && decisionTree[sourceData.yes].id === targetData.id) {
          return 'Да';
        } else if (sourceData.no && decisionTree[sourceData.no].id === targetData.id) {
          return 'Нет';
        }
        return '';
      });
    
    // Добавляем указатель к стрелкам
    svgRef.current.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');
    
  }, [createHierarchy, currentNodeId]);

  const handleAnswerClick = (answer: 'yes' | 'no') => {
    const currentNode = decisionTree[currentNodeId];
    if (answer === 'yes' && currentNode.yes) {
      setCurrentNodeId(decisionTree[currentNode.yes].id);
    } else if (answer === 'no' && currentNode.no) {
      setCurrentNodeId(decisionTree[currentNode.no].id);
    }
  };

  const handleReset = () => {
    setCurrentNodeId('root');
    onEditionSelect(null);
  };

  const currentNode = decisionTree[currentNodeId];
  const isEndNode = !!currentNode.result;

  return (
    <div className="flex flex-col">
      <div className="mb-4 p-4 bg-white shadow rounded-lg">
        <h3 className="text-xl font-bold mb-2">Проводник по выбору редакции DKP</h3>
        <div className="mb-4">
          <p className="text-gray-700">{currentNode.question}</p>
        </div>
        
        {!isEndNode && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswerClick('yes')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!currentNode.yes}
            >
              Да
            </button>
            <button
              onClick={() => handleAnswerClick('no')}
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
      
      <div className="overflow-auto bg-white shadow-lg rounded-lg p-4">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          className="mx-auto"
        >
          <g 
            ref={gRef} 
            transform={`translate(${margin.left},${margin.top})`}
          />
        </svg>
      </div>
    </div>
  );
};

export default DecisionTree;
