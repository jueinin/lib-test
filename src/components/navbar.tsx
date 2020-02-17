import React, {ReactElement, ReactHTMLElement, ReactNode, useRef, useState} from "react";
import {
    NavigateBefore,
    MoreHoriz,
    Close,
    HomeOutlined,
    FindInPageOutlined,
    ShoppingCartOutlined,
    PersonOutlined
} from '@material-ui/icons';
import {useSpring,animated} from 'react-spring'
interface NavBarProps {
    centerPart: ReactNode;
}
const NavBar: React.FC<NavBarProps> = (props) => {
    const [open, setOpen] = useState(false);
    const animatedProps = useSpring({
        to: {
            height: open ? "65px" : "0",
        }
    });
    const items = useRef([
        {
            title: "首页",
            path: "/",
            icon: <HomeOutlined className="text-3xl"/>
        }, {
            title: "分类",
            path: "/classification",
            icon: <FindInPageOutlined className="text-3xl"/>
        },
        {
            title: "购物车",
            path: "/shoppingCart",
            icon: <ShoppingCartOutlined className="text-3xl"/>
        },
        {
            title: "我的",
            path: "/me",
            icon: <PersonOutlined className="text-3xl"/>
        }
    ]);
    return <div>
        <div className="h-12 px-2 bg-white shadow-sm border border-solid border-gray-200 flex items-center">
            <NavigateBefore className="text-3xl"/>
            <div className="text-center flex-grow">
                {props.centerPart}
            </div>
            <div onClick={() => setOpen(!open)}>
                {open ? <Close className="text-3xl "/> : <MoreHoriz className="text-3xl"/>}
            </div>
        </div>
        <animated.ul className="bg-gray-400 grid grid-cols-4 w-full overflow-hidden" style={animatedProps}>
            {items.current.map(value => {
                return <li key={value.path} className="flex flex-col justify-center items-center ">
                    <span className="text-gray-800">{value.icon}</span>
                    <span className="text-lg">{value.title}</span>
                </li>
            })}
        </animated.ul>
    </div>;
};
export default NavBar;
