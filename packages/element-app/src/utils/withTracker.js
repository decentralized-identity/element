import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleAnalytics from 'react-ga';
import { withRouter } from 'react-router';

GoogleAnalytics.initialize('UA-117945399-5');

const withTracker = (WrappedComponent, options = {}) => {
  const trackPage = (page) => {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  };

  // eslint-disable-next-line
  const HOC = class extends Component {
    componentDidMount() {
      // eslint-disable-next-line
      const page = this.props.location.pathname + this.props.location.search;
      trackPage(page);
    }

    componentDidUpdate(prevProps) {
      const currentPage = prevProps.location.pathname + prevProps.location.search;
      const nextPage = window.location.pathname + window.location.search;

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  HOC.propTypes = {
    location: PropTypes.object.isRequired,
  };

  return withRouter(HOC);
};

export default withTracker;
