import React from 'react';
import ReactTooltip from 'react-tooltip';
import CookieBanner from 'react-cookie-banner';
import { HashRouter as Router, NavLink, Route } from 'react-router-dom';

import './AppLayout.css';

import Optimizer from '../../pages/optimizer/Optimizer';
import Augment from '../../pages/augment/Augment';
import NGUs from '../../pages/ngus/NGUs';
import Hacks from '../../pages/hacks/Hacks';
import Wishes from '../../pages/wishes/Wishes';
import About from '../../pages/about/About';
import HowTo from '../../pages/howto/HowTo';


const AppLayout = (props) => (
  <div className="app_container">

    <CookieBanner
      styles={{
        banner: { height: 'auto' },
        message: { fontWeight: 400 },
      }}
      message="This page wants to use local storage and a cookie to respectively keep track of your configuration and consent. Scroll or click to accept."
    />
    <Router>
      <div>
        <nav>
          <ul className="nav-bar-list">
            <li className="nav-bar-item">
              <NavLink to="/" exact className="nav-link" activeClassName="active">Gear</NavLink>
            </li>
            <li className="nav-bar-item">
              <NavLink
                to="/augment"
                exact
                className="nav-link"
                activeClassName="active"
              >
                Augments
              </NavLink>
            </li>
            <li className="nav-bar-item">
              <NavLink to="/ngus" exact className="nav-link" activeClassName="active">NGUs</NavLink>
            </li>
            <li className="nav-bar-item">
              <NavLink
                to="/hacks"
                exact
                className="nav-link"
                activeClassName="active"
              >
                Hacks
              </NavLink>
            </li>
            <li className="nav-bar-item">
              <NavLink
                to="/wishes"
                exact
                className="nav-link"
                activeClassName="active"
              >
                Wishes
              </NavLink>
            </li>
            <li className="nav-bar-item">
              <NavLink to="/howto" exact className="nav-link" activeClassName="active">
                How
                to
              </NavLink>
            </li>
            <li
              className="nav-bar-item"
              style={{
                float: 'right',
                paddingRight: 10,
              }}
            >
              <NavLink
                to="/about/"
                exact
                className="nav-link"
                activeClassName="active"
              >
                About
              </NavLink>
            </li>
          </ul>
        </nav>

        <Route
          exact
          path="/"
          render={(routeProps) => (<Optimizer {...routeProps} {...props} className="app_body" />)}
        />
        <Route exact path="/howto/" component={HowTo} />
        <Route
          exact
          path="/augment/"
          render={(routeProps) => (<Augment {...routeProps} {...props} className="app_body" />)}
        />
        <Route
          exact
          path="/ngus/"
          render={(routeProps) => (
            <NGUs {...routeProps} {...props} className="app_body" />)}
        />
        <Route
          exact
          path="/hacks/"
          render={(routeProps) => (
            <Hacks {...routeProps} {...props} className="app_body" />)}
        />
        <Route
          exact
          path="/wishes/"
          render={(routeProps) => (
            <Wishes {...routeProps} {...props} className="app_body" />)}
        />
        <Route exact path="/about/" component={About} />
      </div>
    </Router>
    <ReactTooltip multiline />
  </div>
);

export default AppLayout;
