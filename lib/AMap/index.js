import React from 'react';
import {
  string,
  node,
  oneOf,
} from 'prop-types';

/**
 * AMap wrapper component to initialise AMap.
 * All map components should be childrens of this wrapper component.
 * AMap component accepts the following config properties to initialise AMap.
 * @param  {MapOptions} props - Properties defined in AMap.Map
 * {@link http://lbs.amap.com/api/javascript-api/reference/map}
 * @param  {string} props.protocol - Protocol, whether it is http or https
 * @param  {string} props.version - AMap javascript library version
 * @param  {string} props.appKey - AMap JS App key
 * @param  {string} props.uiVersion - AMap UI version
 * @param  {string} props.children - Child components
 */
class AMap extends React.PureComponent {
  static propTypes = {
    protocol: oneOf(['http', 'https']),
    version: string,
    appKey: string.isRequired,
    uiVersion: string,
    children: node,
  };

  static defaultProps = {
    protocol: 'http',
    version: '1.4.4',
    uiVersion: '1.0',
  };

  /**
   * Initialise map property with null
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      map: null,
    };
  }

  /**
   * We get map conatiner element reference until this lifecycle method
   * to instantiate AMap map object
   */
  componentDidMount() {
    this.initAMap();
  }

  /**
   * Destroy AMap.Map instance.
   */
  componentWillUnmount() {
    this.state.map.destroy();
  }

  /**
   * Load AMap library when neccessary
   * and instantiate map object by calling AMap.Map
   */
  async initAMap() {
    const {
      protocol,
      version,
      appKey,
      uiVersion,
      ...mapOptions
    } = this.props;

    if (window.AMap === void 0) {
      await this.requireAMap({protocol, version, appKey});
      await this.requireAMapUI({protocol, version: uiVersion});

      this.setState({
        map: new window.AMap.Map(this.mapContainer, mapOptions),
      });
    } else {
      this.setState({
        map: new window.AMap.Map(this.mapContainer, mapOptions),
      });
    }
  }

  /**
   * Create script tag to require AMap library
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap javascript library version
   * @param  {string} options.appKey   - AMap JS App key
   * @return {Promise}                 - Promise created by AMap script tag
   */
  requireAMap({protocol, version, appKey}) {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = `${protocol}://webapi.amap.com/maps?v=${version}&key=${appKey}`;

    document.body.appendChild(scriptTag);

    return new Promise((resolve) => {
      scriptTag.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Create script tag to require AMapUI library
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap UI javascript library version
   * @return {Promise}                 - Promise created by AMap UI script tag
   */
  requireAMapUI({protocol, version}) {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = `${protocol}://webapi.amap.com/ui/${version}/main.js`;

    document.body.appendChild(scriptTag);

    return new Promise((resolve) => {
      scriptTag.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Render a div element as root of AMap
   * Pass map object instantiated by AMap.Map to all direct decendents
   * @return {Component}
   */
  render() {
    const {
      children,
    } = this.props;

    // Pass map object instantiated by AMap.Map to all direct decendents
    const childrenElement = () => {
      return children instanceof Array
        ? children.map((child, index) => {
          return React.cloneElement(child, {key: index, map: map});
        })
        : React.cloneElement(children, {map: map});
    };

    const {
      map,
    } = this.state;

    return (
      <div style={{width: '100%', height: '100%'}}
        ref={(self) => {
          this.mapContainer = self;
        }}>
        {
          map && children && childrenElement()
        }
      </div>
    );
  }
}

export default AMap;