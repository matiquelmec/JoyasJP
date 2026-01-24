'use client'

import { useEffect } from 'react'
import ReactDOM from 'react-dom'

export function PreloadVideo({ src }: { src: string }) {
    useEffect(() => {
        ReactDOM.preload(src, { as: 'video' })
    }, [src])

    return null
}
