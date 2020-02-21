// import React, { useState } from "react";
// import { Route, useHistory } from "react-router-dom";
// import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
// import { Home, Comment, Person } from "@material-ui/icons";
// import IndexPage from "./index";
// import Forum from "./forum";
// import Me from "./me";
// import CacheRoute, { CacheSwitch } from "react-router-cache-route";
// const path = [
//   {
//     name: "首页",
//     path: "/",
//     icon: <Home />
//   },
//   {
//     name: "论坛",
//     path: "/forum",
//     icon: <Comment />
//   },
//   {
//     name: "我的",
//     path: "/me",
//     icon: <Person />
//   }
// ];
// const MainPage: React.FC = () => {
//   const [tab, setTab] = useState(window.location.pathname);
//   const onChange = (event: React.ChangeEvent, value: string) => {
//     setTab(value);
//   };
//   const history = useHistory();
//   return (
//     <div className="">
//       <main className="mb-16">
//         <CacheSwitch>
//           <CacheRoute exact path={"/"}>
//             <IndexPage />
//           </CacheRoute>
//           <Route exact path={"/forum"}>
//             <Forum />
//           </Route>
//           <Route exact path={"/me"}>
//             <Me />
//           </Route>
//         </CacheSwitch>
//       </main>
//       <BottomNavigation
//         className="mt-auto fixed bottom-0 w-full"
//         showLabels
//         value={tab}
//         onChange={onChange}
//       >
//         {path.map(value => {
//           return (
//             <BottomNavigationAction
//               label={value.name}
//               key={value.name}
//               icon={value.icon}
//               value={value.path}
//               onClick={() => {
//                 history.push(value.path);
//               }}
//             />
//           );
//         })}
//       </BottomNavigation>
//     </div>
//   );
// };
// export default MainPage;
