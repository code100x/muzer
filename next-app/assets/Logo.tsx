import React from 'react'

const Logo = ({className}: {className?: string}) => {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <mask id="mask0_2019_470" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
                <path d="M16.9999 16.9999L0 16.9999L0 1.192e-07L16.9999 1.192e-07L16.9999 16.9999Z" fill="white" />
            </mask>
            <g mask="url(#mask0_2019_470)">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.24998 16.9999L16.9999 16.9999L16.9999 12.7499L16.9999 4.24998L12.7499 1.192e-07L12.7499 12.7499L0 12.7499L4.24998 16.9999ZM0 2.96929L0 8.49996L5.53067 8.49996L0 2.96929ZM8.49996 1.192e-07L3.04109 1.192e-07L8.49996 5.45885L8.49996 1.192e-07Z" fill="url(#paint0_linear_2019_470)" />
            </g>
            <defs>
                <linearGradient id="paint0_linear_2019_470" x1="15.0449" y1="16.9999" x2="3.35748" y2="4.03748" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="#E7E9FF" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export default Logo