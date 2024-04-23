import { Link } from "react-router-dom"


export const Navbar = () => {

    return (
        <nav className="flex justify-between gap-2 px-10 py-2 border-b items-center">

            <Link to="/" className="cursor-pointer font-semibold flex items-center gap-2">
                <img
                    className="w-10 rounded-md border border-solid dark:border-gray-800"
                    src="https://res.cloudinary.com/dactx35rr/image/upload/v1713646327/bearhunters/bh_z56geq.png"
                    alt=""
                />
                Home</Link>

            <div className="flex gap-10 justify-end items-end">
                <Link to="/settings" className="cursor-pointer font-semibold">Settings</Link>
            </div>
        </nav>
    )
}