import { Button } from './Button'
export function Pagination({ page, onPrev, onNext }: { page: number; onPrev: () => void; onNext: () => void }) { return <div className='flex gap-2 items-center'><Button onClick={onPrev}>Prev</Button><span>{page}</span><Button onClick={onNext}>Next</Button></div> }
