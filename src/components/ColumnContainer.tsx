import { SortableContext, useSortable } from '@dnd-kit/sortable'
import TrashIcon from '../icons/TrashIcon'
import { Column, ID, Task } from '../types'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import PlusIcon from '../icons/PlusIcon'
import TaskCard from './TaskCard'

interface Props {
  column: Column
  updateColumn: (id: ID, title: string) => void
  deleteColumn: (id: ID) => void
  createTask: (columnId: ID) => void
  tasks: Task[]
  updateTask: (id: ID, content: string) => void
  deleteTask: (id: ID) => void
}

const ColumnContainer = (props: Props) => {
  const { column, updateColumn, deleteColumn, createTask, tasks, deleteTask, updateTask } = props

  const tasksIds = useMemo(() => tasks.map(task => task.id), [tasks])

  const [editMode, setEditMode] = useState(false)

  const { attributes, listeners, setNodeRef, transition, transform, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='bg-columnBackgroundColor opacity-40 border-2 border-rose-500 w-[350px] h-[600px] max-h-[600px] rounded-md flex flex-col'
      ></div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-columnBackgroundColor w-[350px] h-[600px] max-h-[600px] rounded-md flex flex-col'
    >
      {/* Column Title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className='bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between'
      >
        <div className='flex items-center gap-2'>
          <div className='flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full'>
            {tasks.length}
          </div>
          {!editMode ? (
            <div className='text-md line-clamp-1'>{column.title}</div>
          ) : (
            <input
              className='bg-black focus:border-rose-500 border rounded outline-none px-2'
              value={column.title}
              onChange={e => {
                updateColumn(column.id, e.target.value)
              }}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={e => {
                if (e.key !== 'Enter') return
                setEditMode(false)
              }}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className='stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded p-1.5'
        >
          <TrashIcon className='text-2xl' />
        </button>
      </div>

      {/* Column Task Container */}
      <div className='flex flex-grow flex-col gap-2 p-2 overflow-x-hidden overflow-y-auto'>
        <SortableContext items={tasksIds}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <button
        className='flex gap-2 items-center justify-center border-columnBackgroundColor border-2 rounded-md p-4 hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black'
        onClick={() => createTask(column.id)}
      >
        <PlusIcon className='text-2xl' />
        Add Task
      </button>
    </div>
  )
}

export default ColumnContainer
