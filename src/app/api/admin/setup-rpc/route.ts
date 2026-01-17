import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminAuth } from '@/lib/admin-auth'

// POST - Proporcionar SQL para la función RPC process_order_payment
export async function POST(request: NextRequest) {
    if (!verifyAdminAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    try {
        // Este endpoint sirve para obtener el DDL necesario si se necesita reinstalar
        return NextResponse.json({
            message: 'SQL Function Definition',
            sql: `
CREATE OR REPLACE FUNCTION process_order_payment(
  p_order_id UUID,
  p_payment_status TEXT,
  p_payment_detail TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_current_stock INT;
  v_items_json JSONB;
BEGIN
  -- 1. Lock order row for update
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  -- 2. Idempotency Check
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already paid (Idempotent)');
  END IF;

  -- 3. Update Order Status
  UPDATE orders 
  SET 
    status = CASE WHEN p_payment_status = 'approved' THEN 'paid' ELSE p_payment_status END,
    payment_status = p_payment_status,
    payment_detail = p_payment_detail,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- 4. Decrement Stock (Only if approved)
  IF p_payment_status = 'approved' THEN
    
    -- Handle items type (Text or JSONB)
    BEGIN
        v_items_json := v_order.items::jsonb;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid items format');
    END;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_json) LOOP
      v_product_id := (v_item->>'id')::UUID;
      v_quantity := (v_item->>'quantity')::INT;

      -- Check and Update Stock
      UPDATE products
      SET stock = stock - v_quantity
      WHERE id = v_product_id AND stock >= v_quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Order processed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;
      `
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
