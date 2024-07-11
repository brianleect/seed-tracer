import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '../../../types'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const searchTillRoot = searchParams.get('searchTillRoot')

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

    if (!serverUrl) {
        return NextResponse.json({ error: 'Server URL is not configured' }, { status: 500 })
    }

    try {
        const response = await fetch(`${serverUrl}/footprints?address=${address}&searchTillRoot=${searchTillRoot}`)
        const data: ApiResponse = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching data: ', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}
