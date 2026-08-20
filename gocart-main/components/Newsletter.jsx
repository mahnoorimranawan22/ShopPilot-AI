import React from 'react'
import Title from './Title'

const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title="Stay in the Loop" description="Get AI-curated deals, personalized product picks, and exclusive offers delivered to your inbox every week." visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input className='flex-1 pl-5 outline-none' type="text" placeholder='Enter your email address' />
                <button className='font-medium bg-indigo-500 text-white px-7 py-3 rounded-full hover:bg-indigo-600 hover:scale-103 active:scale-95 transition'>Get Updates</button>
            </div>
        </div>
    )
}

export default Newsletter
