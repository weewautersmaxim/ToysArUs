import React from "react";

const navLinks = [
  {
    title: "About",
    path: "/",
  },
  {
    title: "Projects",
    path: "/projects",
  },
  {
    title: "Blog",
    path: "/blog",
  },
  {
    title: "Contact",
    path: "/contact",
  },
];

export default function Navbar() {
  const [active, setActive] = React.useState(false);

  return (
    <>
      <div className="navbar c-nav">
        <span>Toys "AR" Us</span>
        <ul className={`navbarNav ${active && "active"}`}>
          {navLinks.map((links, index) => (
            <NavItem
              key={index}
              something={links.title}
              title={links.title}
              path={links.path}
            />
          ))}
        </ul>
        <div className="hamburgerIcon" onClick={() => setActive(!active)}></div>
      </div>
    </>
  );
}

function NavItem({ title, path, something }: any) {
  return (
    <li className={`navItem ${something}`}>
      <a href={path}>{title}</a>
    </li>
  );
}
