"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product, CartItem } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Agrega un producto al carrito o incrementa su cantidad si ya existe
  const addItem = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  // Elimina un producto del carrito
  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  // Actualiza la cantidad de un producto específico
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    )
  }

  // Vacía todo el carrito
  const clearCart = () => setItems([])

  // Cuenta total de productos en el carrito
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  // Precio total del carrito
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el carrito en cualquier componente
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}