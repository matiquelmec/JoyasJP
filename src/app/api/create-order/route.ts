import { NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, shipping_address, contact_email, ordered_products, total_amount } = body

    if (
      !customer_name ||
      !shipping_address ||
      !contact_email ||
      !ordered_products
    ) {
      return NextResponse.json(
        { error: 'Missing required order information.' },
        { status: 400 }
      )
    }

    // Ejecutar transacción atómica en Turso
    const tx = await turso.transaction("write")
    try {
      // 1. Validar stock de cada producto en la transacción
      for (const item of ordered_products) {
        const { rows } = await tx.execute({
          sql: "SELECT stock, name, is_bundle FROM products WHERE id = ?",
          args: [item.product_id]
        })

        if (rows.length === 0) {
          throw new Error(`Product not found: ${item.product_id}`)
        }

        const product = rows[0]
        const isBundle = Boolean(product.is_bundle === 1)

        if (isBundle) {
          // Obtener los componentes del conjunto
          const { rows: components } = await tx.execute({
            sql: "SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?",
            args: [item.product_id]
          })

          if (components.length === 0) {
            throw new Error(`El conjunto "${product.name}" no tiene piezas asociadas en inventario.`)
          }

          // Validar stock de cada pieza componente
          for (const comp of components) {
            const { rows: compRows } = await tx.execute({
              sql: "SELECT stock, name FROM products WHERE id = ?",
              args: [comp.product_id]
            })

            if (compRows.length === 0) {
              throw new Error(`Component product not found: ${comp.product_id}`)
            }

            const compProduct = compRows[0]
            const requiredQty = Number(comp.quantity || 1) * item.quantity

            if (Number(compProduct.stock || 0) < requiredQty) {
              throw new Error(`Stock insuficiente para la pieza "${compProduct.name}" componente del conjunto "${product.name}"`)
            }
          }
        } else {
          // Producto común
          const currentStock = Number(product.stock || 0)
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente para: ${product.name}`)
          }
        }
      }

      // 2. Descontar el stock
      for (const item of ordered_products) {
        const { rows } = await tx.execute({
          sql: "SELECT is_bundle FROM products WHERE id = ?",
          args: [item.product_id]
        })

        const isBundle = Boolean(rows[0]?.is_bundle === 1)

        if (isBundle) {
          // Descontar stock de cada componente
          const { rows: components } = await tx.execute({
            sql: "SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?",
            args: [item.product_id]
          })

          for (const comp of components) {
            const requiredQty = Number(comp.quantity || 1) * item.quantity
            await tx.execute({
              sql: "UPDATE products SET stock = stock - ? WHERE id = ?",
              args: [requiredQty, comp.product_id]
            })
          }
        } else {
          // Descontar stock de producto común
          await tx.execute({
            sql: "UPDATE products SET stock = stock - ? WHERE id = ?",
            args: [item.quantity, item.product_id]
          })
        }
      }

      // 3. Crear la orden de compra
      const orderId = crypto.randomUUID()
      await tx.execute({
        sql: `INSERT INTO orders (
          id, customer_name, customer_email, shipping_address, items, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        args: [
          orderId,
          customer_name,
          contact_email,
          shipping_address,
          JSON.stringify(ordered_products),
          Number(total_amount || 0)
        ]
      })

      // Confirmar transacción
      await tx.commit()

      return NextResponse.json(
        { message: 'Order created successfully', order_id: orderId },
        { status: 201 }
      )

    } catch (txError: any) {
      // Revertir en caso de cualquier error
      await tx.rollback()
      console.error('Transaction rollback due to:', txError.message)
      return NextResponse.json(
        { error: 'Failed to process order.', details: txError.message },
        { status: 409 }
      )
    }

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}
