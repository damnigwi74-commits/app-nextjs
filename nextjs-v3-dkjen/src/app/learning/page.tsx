import React from 'react'

const Learning = () => {
    return (
        <div className='mt-20 flex flex-col items-start justify-center m-36 '>

            <div className='flex items-center p-5 bg-amber-700 text-white rounded-t-2xl'>
                If You ean to add a park, please contact us at  If You ean to add a park, please contact us at
                If You ean to add a park, please contact us at
            </div>
            <div className='flex flex-col items-start justify-start p-5 bg-amber-100 rounded-b-2xl  border-2 border-amber-700 '>
                <p className=' text-amber-900 text-2xl'>
                    Daniel Migwi
                </p>

                <p className=' text-amber-500'>
                    If You ean to add a park, please contact us at
                </p>

            </div>


            {/*  */}

            <div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-slate-100 p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 mt-20">
                <img className="size-12 shrink-0" src="logo.svg" alt="ChitChat Logo" />
                <div>
                    <div className="text-xl font-medium text-black dark:text-white">ChitChat</div>
                    <p className="text-gray-500 dark:text-gray-400">You have a new message!</p>
                </div>
            </div>

            {/*  */}
        </div>
    )
}

export default Learning