import React from 'react'
import Link from "next/link"

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound } from 'lucide-react'


const Learning = () => {
    return (
        <div className=' m-20 gap-5'>
            {/*  */}
            <div className='p-20 mt-20 flex flex-col items-start justify-center m-36 border-2 border-amber-700'>

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



            </div>

            {/*  */}
            <div className="mt-10 border-2 border-amber-700 p-20">
                <div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-slate-100 p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 mt-20">
                    <img className="size-12 shrink-0" src="logo.svg" alt="ChitChat Logo" />
                    <div>
                        <div className="text-xl font-medium text-black dark:text-white">ChitChat</div>
                        <p className="text-gray-500 dark:text-gray-400">You have a new message!</p>
                    </div>
                </div>
            </div>

            {/*  */}
            <div className="mt-10 border-2 border-amber-700 p-20">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1">
                                    <BreadcrumbEllipsis className="size-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                                    <DropdownMenuItem>Themes</DropdownMenuItem>
                                    <DropdownMenuItem>GitHub</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/docs/components">Components</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/*  */}
            <div className="mt-10 border-2 border-amber-700 p-20 h-screen flex flex-col">

                <div className=' bg-orange-200 flex justify-between px-4 py-2 text-orange-600'>

                    <div className=' flex items-center'>
                        <div className='mx-4'>About</div>
                        <div className='mx-4'>Store</div>
                    </div>

                    <div className=' flex items-center'>
                        <div className='mx-4'>Settings</div>
                        <div className='mx-4'>
                            <UserRound className='fa-reguar fa-user text-3xl text-violet-600' />
                        </div>
                    </div>

                </div>

                <div className='border-2 border-blue-600 flex-1 flex flex-col justify-center items-center text-orange-100'>
                    <div className='text-6xl text-orange-600'>Foogle</div>

                     <div className='text-6xl text-orange-600'>Search</div>
                </div>
            </div>

             {/*  */}
        </div>
    )
}

export default Learning