import { PropsWithChildren } from 'react'
export const Modal = ({ children }: PropsWithChildren) => <div className='fixed inset-0 bg-black/40 grid place-items-center'><div className='bg-white p-4 rounded w-full max-w-lg'>{children}</div></div>
