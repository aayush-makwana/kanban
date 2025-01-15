// React Imports
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

// Third-party Imports
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'

// Types Imports
import type { Column, ID, Task } from '../types'

// Icons Imports
import PlusIcon from '../icons/PlusIcon'

// Components Imports
import ColumnContainer from './ColumnContainer'
import TaskCard from './TaskCard'

// Vars
const INITIAL_COLUMNS: Column[] = [
  { id: 5751, title: 'Not Started' },
  { id: 2780, title: 'In Progress' },
  { id: 5375, title: 'Done' }
]

const INITIAL_TASKS: Task[] = [{ id: 6315, columnId: 5751, content: 'Initial Task' }]

const KanbanBoard = () => {
  // States
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS)
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isFirstRender, setIsFirstRender] = useState(true)

  // Memos
  const columnsIds = useMemo(() => columns.map(column => column.id), [columns])

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

  // Effects
  useEffect(() => {
    // Load data on first render
    if (isFirstRender) {
      try {
        const savedColumns = localStorage.getItem('kanban-columns')
        const savedTasks = localStorage.getItem('kanban-tasks')

        // Load saved data if it exists
        if (savedColumns) {
          const parsedColumns = JSON.parse(savedColumns) as Column[]
          setColumns(parsedColumns)
        }
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks) as Task[]
          setTasks(parsedTasks)
        }
        setIsFirstRender(false)
      } catch (error) {
        console.error('Error loading data from localStorage:', error)
      }
      return
    }

    // Save data on subsequent updates
    try {
      localStorage.setItem('kanban-columns', JSON.stringify(columns))
      localStorage.setItem('kanban-tasks', JSON.stringify(tasks))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }, [columns, tasks, isFirstRender])

  // Functions
  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: 'Untitled Column'
    }
    setColumns(prevColumns => [...prevColumns, columnToAdd])
  }

  const updateColumn = (id: ID, title: string) => {
    setColumns(prevColumns => prevColumns.map(column => (column.id === id ? { ...column, title } : column)))
  }

  const deleteColumn = (id: ID) => {
    setColumns(prevColumns => prevColumns.filter(column => column.id !== id))
    setTasks(prevTasks => prevTasks.filter(task => task.columnId !== id))
  }

  const createTask = (columnId: ID) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: 'Untitled Task'
    }
    setTasks(prevTasks => [...prevTasks, newTask])
  }

  const updateTask = (id: ID, content: string) => {
    setTasks(prevTasks => prevTasks.map(task => (task.id === id ? { ...task, content } : task)))
  }

  const deleteTask = (id: ID) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  // Drag & Drop Handlers
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeColumnId = active.id
    const overColumnId = over.id

    if (activeColumnId === overColumnId) return

    setColumns(prevColumns => {
      const activeColumnIndex = prevColumns.findIndex(column => column.id === activeColumnId)
      const overColumnIndex = prevColumns.findIndex(column => column.id === overColumnId)

      return arrayMove(prevColumns, activeColumnIndex, overColumnIndex)
    })
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    // Dropping task over another task
    if (isActiveATask && isOverATask) {
      setTasks(prevTasks => {
        const activeTaskIndex = prevTasks.findIndex(task => task.id === activeId)
        const overTaskIndex = prevTasks.findIndex(task => task.id === overId)

        prevTasks[activeTaskIndex].columnId = prevTasks[overTaskIndex].columnId

        return arrayMove(prevTasks, activeTaskIndex, overTaskIndex)
      })
    }

    // Dropping task over a column
    const isOverAColumn = over.data.current?.type === 'Column'
    if (isActiveATask && isOverAColumn) {
      setTasks(prevTasks => {
        const activeTaskIndex = prevTasks.findIndex(task => task.id === activeId)

        prevTasks[activeTaskIndex].columnId = overId

        return arrayMove(prevTasks, activeTaskIndex, activeTaskIndex)
      })
    }
  }

  return (
    <div className='m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden p-10'>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className='m-auto flex items-start gap-4'>
          <div className='flex items-start gap-4'>
            <SortableContext items={columnsIds}>
              {columns.map(column => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  updateColumn={updateColumn}
                  deleteColumn={deleteColumn}
                  createTask={createTask}
                  tasks={tasks.filter(task => task.columnId === column.id)}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => createNewColumn()}
            className='h-[60px] w-80 sm:w-[350px] min-w-80 sm:min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex items-center gap-2'
          >
            <PlusIcon className='text-2xl' />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                updateColumn={updateColumn}
                deleteColumn={deleteColumn}
                createTask={createTask}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            )}
            {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}

const generateId = () => {
  // Generate a random number between 1 and 10000
  return Math.floor(Math.random() * 10001)
}

export default KanbanBoard
