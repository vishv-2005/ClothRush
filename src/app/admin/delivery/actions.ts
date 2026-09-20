'use server'

import { createClient } from '@supabase/supabase-js'

export async function createDeliveryPartner(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const vehicleType = formData.get('vehicleType') as string
    const licenseNumber = formData.get('licenseNumber') as string

    if (!email || !password || !fullName || !phone) {
      return { success: false, error: 'Missing required fields' }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Server misconfiguration' }
    }

    // Create a Supabase admin client to bypass row level security and signup rate limits
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'DELIVERY_PARTNER'
      }
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    const userId = authData.user.id

    // 2. The trigger `handle_new_user` will automatically create the profile row.
    // However, we need to create the delivery_partners row manually.
    const { error: dpError } = await supabase.from('delivery_partners').insert({
      user_id: userId,
      name: fullName,
      phone: phone,
      availability: 'AVAILABLE'
    })

    if (dpError) {
      return { success: false, error: dpError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
