export default function Cooyub({svgStyle, rectStyle, fill}) {
  return (
    <svg className={svgStyle}>
      <rect className={rectStyle} xmlns="http://www.w3.org/2000/svg" fill={fill}/>
    </svg>
  )
}