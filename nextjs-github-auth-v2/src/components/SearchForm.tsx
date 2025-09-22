import React from 'react'
import Form from 'next/form'
import SearchFormReset from './SearchFormReset'


const SearchForm = () => {
    const quary = 'Test'

  
    return (
        <Form action="/" scroll={false} className='max-w-3xl w-full min-h-[80px] bg-white border-[5px] border-black rounded-[80px] text-[24px] mt-8 px-5 flex flex-row items-center gap-5'>
            <input
                type="text"
                name="query"
                defaultValue={''}
                placeholder="Search destinations..." />
            <div className='flex gap-2'>
                {quary && <SearchFormReset /> }
            </div>

        </Form>
    )
}

export default SearchForm