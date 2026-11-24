const paths={
  home:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-7 8-7s8 2 8 7"/></>,
  users:<><circle cx="9" cy="8" r="3"/><path d="M2 20v-2c0-3 3-5 7-5s7 2 7 5v2M16 5c3 0 4 2 4 4s-2 4-4 4M18 14c3 0 4 2 4 5"/></>,
  shield:<><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
  calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 11h18"/></>,
  box:<><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/></>,
  tag:<><path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="8" cy="8" r="1"/></>,
  truck:<><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  wrench:<path d="M20 7a6 6 0 0 1-8 6l-7 7a2 2 0 0 1-3-3l7-7a6 6 0 0 1 8-8l-4 4 4 4 3-3Z"/>,
  shopping:<><path d="M3 5h2l3 12h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
  file:<><path d="M7 3h7l5 5v13H5V5a2 2 0 0 1 2-2ZM14 3v6h5M8 14h8M8 17h8"/></>,
  history:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/></>,
  building:<><path d="M3 21V6h10v15M13 10h8v11M6 9h4M6 13h4M6 17h4M16 13h2M16 17h2M2 21h20"/></>,
  logout:<><path d="M10 3H4v18h6M14 7l5 5-5 5M7 12h12"/></>,
  plus:<path d="M12 4v16M4 12h16"/>,
  edit:<><path d="m4 20 4-.5L20 7.5 16.5 4 4.5 16 4 20ZM14.5 6 18 9.5"/></>,
  arrow:<><path d="M4 12h16m-7-7 7 7-7 7"/></>,
  lock:<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
}
export default function PortalIcon({name='home',size=21}){
 return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.home}</svg>
}
