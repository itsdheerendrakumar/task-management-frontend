export function NoDataFound({message = "No data found."}: {message?: string}) {
    return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Info! </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    )
}