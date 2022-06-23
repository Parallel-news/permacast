export function Cooyub({svgStyle, rectStyle, fill}) {
  return (
    <svg className={svgStyle} style={{borderRadius: '4px'}}>
      <rect className={rectStyle} xmlns="http://www.w3.org/2000/svg" fill={fill}/>
    </svg>
  )
}

export function PlayButton ({svgStyle, fill, outline, size="20"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill={svgStyle} xmlns="http://www.w3.org/2000/svg">
      <path d="M13 9L5 4V14L13 9Z" fill={fill} stroke={outline} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function GlobalPlayButton ({appState,  size="20"}) {
  const cl = appState.themeColor;
  const bg = cl.replace('rgb', 'rgba').replace(')', ', 0.1)');
  const paddingSize = size * 0.5;

  return (
    <div className="cursor-pointer rounded-[34px]" style={{backgroundColor: bg, padding: paddingSize + "px"}}>
      <PlayButton svgStyle={cl} fill={cl} outline={cl} size={size} />
    </div>
  )
}
