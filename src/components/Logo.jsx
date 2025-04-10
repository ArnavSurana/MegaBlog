import React from 'react'
import logoImage from '../assets/Screenshot 2025-04-10 161657.png'

function Logo({width="100px"}) {
  return (
    <div>
      <img src={logoImage} alt="LOGO" width={width} />
    </div>
  )
}

export default Logo
