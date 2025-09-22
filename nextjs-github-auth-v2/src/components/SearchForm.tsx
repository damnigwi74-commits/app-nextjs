import React from 'react'
import Form from 'next/form'
import SearchFormReset from './SearchFormReset'


const SearchForm = () => {
    const quary = 'Test'

  
    return (
        <Form action="/" scroll={false} className='search-form'>
            <input
                type="text"
                name="query"
                defaultValue={''}
                placeholder="Search destinations..." />
            <div className='flex gap-8'>
                {quary && <SearchFormReset /> }
            </div>

        </Form>
    )
}

export default SearchForm