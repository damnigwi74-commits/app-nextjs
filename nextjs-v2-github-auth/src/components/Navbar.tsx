import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { signIn, signOut, auth } from '../../auth'   // relative path


const Navbar = async () => {

    const session = await auth()

    return (
        <header className='px-5 py-3 bg-white shadow-sm font-work-sans' >
            <nav className='flex justify-between items-center'>
                <Link href="/">
                    <Image src="/logo.svg" alt="Logo" width={150} height={50} />
                </Link>

                <div className='flex items-center gap-5'>
                    {session && session?.user ? (
                        <>
                            <Link href="/startup/create" className='text-gray-600 hover:text-gray-800'>
                                <span>Create</span>
                            </Link>

                            <form
                                action={ async()=>{ 
                                    "use server"
                                    await signOut()}
                                }
                                className='bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-400'>
                                 <button type='submit'>Sign Out </button>
                            </form>
                            {/*  */}
                            <Link href={`/user/${session?.id}`}>
                            <span className='text-gray-600 hover:text-gray-800'>
                                {session?.user?.name}
                                </span>
                                </Link>

                        </>
                    ) : (
                        <>
                            <form
                                action={ async()=>{ 
                                    "use server"
                                    await signIn('github')}
                                }
                                className='bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500'>
                                <button type='submit'>Sign In </button>
                            </form>
                        </>
                    )
                    }
                </div>
            </nav>
        </header >
    )
}

export default Navbar