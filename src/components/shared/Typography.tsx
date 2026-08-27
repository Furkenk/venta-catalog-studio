import React from 'react';
export const Serif:React.FC<{children:React.ReactNode;className?:string}>=({children,className})=><h2 className={`font-serif tracking-tight leading-tight ${className??''}`}>{children}</h2>;
export const Sans:React.FC<{children:React.ReactNode;className?:string}>=({children,className})=><p className={`font-sans tracking-wide ${className??''}`}>{children}</p>;
export const Label:React.FC<{children:React.ReactNode;className?:string}>=({children,className})=><span className={`font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 ${className??''}`}>{children}</span>;
export const Display:React.FC<{children:React.ReactNode;className?:string}>=({children,className})=><h1 className={`font-serif italic text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none ${className??''}`}>{children}</h1>;
