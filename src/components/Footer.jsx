import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="keeper-footer">
      <p>Copyright ⓒ {year} Keeper. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
