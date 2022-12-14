import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const Context = createContext()

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalQuantities, setTotalQuantities] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    localStorage.getItem('cartItems') &&
      setCartItems(JSON.parse(localStorage.getItem('cartItems')))
    localStorage.getItem('totalPrice') &&
      setTotalPrice(JSON.parse(localStorage.getItem('totalPrice')))
    localStorage.getItem('totalQuantities') &&
      setTotalQuantities(JSON.parse(localStorage.getItem('totalQuantities')))
  }, [])

  useEffect(() => {
    if (cartItems && totalPrice && totalQuantities) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
      localStorage.setItem('totalPrice', JSON.stringify(totalPrice))
      localStorage.setItem('totalQuantities', JSON.stringify(totalQuantities))
    }
  }, [cartItems, totalPrice, totalQuantities])

  let foundProduct

  const onAdd = (product, quantity) => {
    const checkProductInCart = cartItems.find(item => item._id === product._id)

    setTotalPrice(prevTP => prevTP + product.price * quantity)
    setTotalQuantities(prevTQts => prevTQts + quantity)

    if (checkProductInCart) {
      const updatedCartItems = cartItems.map(cartProduct => {
        if (cartProduct._id === product._id)
          return {
            ...cartProduct,
            quantity: cartProduct.quantity + quantity,
          }
      })

      setCartItems(updatedCartItems)
    } else {
      product.quantity = quantity

      setCartItems([...cartItems, { ...product }])
    }

    toast.success(`${qty} ${product.name} added to the cart.`)
  }

  const onRemove = product => {
    foundProduct = cartItems.find(item => item._id === product._id)
    const newCartItems = cartItems.filter(item => item._id !== product._id)

    setTotalPrice(prevTP => prevTP - foundProduct.price * foundProduct.quantity)
    setTotalQuantities(prevTQts => prevTQts - foundProduct.quantity)
    setCartItems(newCartItems)
    cartItems.length === 1 && localStorage.clear()
  }

  const toggleCartItemQuanitity = (id, value) => {
    foundProduct = cartItems.find(item => item._id === id)

    if (value === 'inc') {
      setCartItems(
        cartItems.map(item =>
          item._id === foundProduct._id
            ? { ...foundProduct, quantity: foundProduct.quantity + 1 }
            : item
        )
      )
      setTotalPrice(prevTP => prevTP + foundProduct.price)
      setTotalQuantities(prevTQts => prevTQts + 1)
    } else if (value === 'dec') {
      if (foundProduct.quantity > 1) {
        setCartItems(
          cartItems.map(item =>
            item._id === foundProduct._id
              ? { ...foundProduct, quantity: foundProduct.quantity - 1 }
              : item
          )
        )
        setTotalPrice(prevTP => prevTP - foundProduct.price)
        setTotalQuantities(prevTQts => prevTQts - 1)
      }
    }
  }

  const incQty = () => {
    setQty(prevQty => prevQty + 1)
  }

  const decQty = () => {
    setQty(prevQty => {
      if (prevQty - 1 < 1) return 1

      return prevQty - 1
    })
  }

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        totalPrice,
        totalQuantities,
        qty,
        setQty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuanitity,
        onRemove,
        setCartItems,
        setTotalPrice,
        setTotalQuantities,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useStateContext = () => useContext(Context)
