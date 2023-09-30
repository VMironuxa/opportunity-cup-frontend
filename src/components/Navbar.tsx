import React, { useEffect, useState } from 'react';
import '../assets/scss/components/_navbar.scss';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../assets/img/logotype-white.svg';
import { ReactComponent as Plus } from '../assets/img/Plus.svg';
import { ReactComponent as BurgerMenu } from '../assets/img/navbarIcons/burger_menu.svg';
import MobileSidebar from './MobileSidebar';
import { useGetToken } from '../hooks/useGetToken';
import { getUser } from '../utils/getUser';
import { useWindowSize } from '../hooks/useWindowSize';
import { userApi } from '../store';
import { getSettingsData } from '../types/customPageTypes';
import TopUpModal from './Shop/Modals/TopUp/TopUpModal';
import { handleSteamLogin } from '../utils/handleSteamLogin';

interface NavbarProps {
  navbar: getSettingsData;
}
const Navbar = ({ navbar }: NavbarProps) => {
  const token = useGetToken();
  const user = getUser();
  const [getBalance, { data: userBalace }] = userApi.useLazyGetBalanceQuery();
  const [activeNavbarItem, setActiveNavbarItem] = useState(0);

  const dimensions = useWindowSize();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      getBalance();
    }
  }, []);

  const [isActiveBurger, setIsActiveBurger] = useState(false);
  const [isActiveModal, setIsActiveModal] = useState(false);

  return (
    <>
      <div className="header-plug" />
      <div className="header">
        <div className="container">
          <div className="header_inner">
            <Link to="/store" className="logo_img" onClick={() => setActiveNavbarItem(0)}>
              <Logo />
            </Link>
            {dimensions.width <= 1000 && (
              <>
                <BurgerMenu onClick={() => setIsActiveBurger(true)} className="burgerMenuIcon" />
                {navbar && (
                  <MobileSidebar isActiveBurger={isActiveBurger} setIsActiveBurger={setIsActiveBurger} data={navbar} />
                )}
              </>
            )}

            <nav className="navbar">
              {navbar?.panelURLs.top.sections.map((item, index) => (
                <Link
                  to={item.url}
                  className={`${activeNavbarItem === index + 1 ? 'navbar__itemActive' : 'navbar__item'}`}
                  key={item.id}
                  onClick={() => setActiveNavbarItem(index + 1)}
                >
                  <img src={item.icon} className="navbar__icon" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {dimensions.width >= 1200 && (
              <div className="contacts">
                {navbar?.panelURLs.top.isShowContacts &&
                  navbar?.panelURLs.top.contacts.map(it => (
                    <a href={it.url} target="_blank" className="contacts_item" key={it.id}>
                      <img src={it.icon} className="icon-contact" />
                    </a>
                  ))}
              </div>
            )}

            {isActiveModal && <TopUpModal setIsActive={setIsActiveModal} />}

            {token !== null ? (
              <div className="profile">
                <div className="balanse" onClick={() => setIsActiveModal(true)}>
                  <span>{userBalace?.balance} ₽</span>
                  <Plus />
                </div>
                <Link to="/profile" className="profile__icon" onClick={() => setActiveNavbarItem(0)}>
                  <img src={user?.avatar} alt="" className="avatar-in-navbar" />
                  {/* <div className="lvlIconBlock">
                    <div className="lvlIcon">
                      <LvlIcon />
                      <span className="lvlTitle">{7}</span>
                    </div>
                  </div> */}
                </Link>
              </div>
            ) : (
              <div className="profile" onClick={handleSteamLogin} style={{ cursor: 'pointer' }}>
                Войти
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;