import { useState } from 'react'
import TrashIcon from '../icons/TrashIcon'
import { ID, Task } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
interface Props {
  task: Task
  deleteTask: (id: ID) => void
  updateTask: (id: ID, content: string) => void
}

const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const { attributes, listeners, setNodeRef, transition, transform, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  const toggleEditMode = () => {
    setEditMode(prev => !prev)
    setMouseIsOver(false)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='bg-mainBackgroundColor opacity-40 p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl border-2 border-rose-500 cursor-grab relative'
      />
    )
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative'
      >
        <textarea
          className='h-[90%] w-full resize-none rounded bg-transparent text-white focus:outline-none'
          value={task.content}
          autoFocus
          placeholder='Task Content here'
          onBlur={toggleEditMode}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.shiftKey) {
              toggleEditMode()
            }
          }}
          onChange={e => updateTask(task.id, e.target.value)}
        ></textarea>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task'
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <p className='my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap'>{task.content}</p>
      {mouseIsOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className='stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-1.5 rounded'
        >
          <TrashIcon className='text-xl' />
        </button>
      )}
    </div>
  )
}

export default TaskCard
