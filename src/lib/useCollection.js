import { useCallback, useState } from 'react'
import { addItem, list, removeItem, updateItem } from './storage'

// React-Hook um eine Collection (z.B. "workouts") zu lesen und zu verändern.
// Hält den State synchron, ohne dass jede View selbst localStorage anfassen muss.
export function useCollection(collection) {
  const [items, setItems] = useState(() => list(collection))

  const add = useCallback(
    (item) => {
      addItem(collection, item)
      setItems(list(collection))
    },
    [collection],
  )

  const update = useCallback(
    (id, patch) => {
      updateItem(collection, id, patch)
      setItems(list(collection))
    },
    [collection],
  )

  const remove = useCallback(
    (id) => {
      removeItem(collection, id)
      setItems(list(collection))
    },
    [collection],
  )

  return { items, add, update, remove }
}
