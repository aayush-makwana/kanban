import { useMemo, useState } from 'react'
import PlusIcon from '../icons/PlusIcon'
import { Column, ID, Task } from '../types'
import ColumnContainer from './ColumnContainer'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import TaskCard from './TaskCard'

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([])
  const columnsIds = useMemo(() => columns.map(column => column.id), [columns])

  const [tasks, setTasks] = useState<Task[]>([])

  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

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
    <div className='m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10'>
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
            className='h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex items-center gap-2'
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
