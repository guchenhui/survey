import React from 'react';
import styles from './BackTop.css';
import Animate from 'rc-animate';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import classNames from 'classnames';
import omit from 'omit.js';
import getScroll from '../_util/getScroll';
import getRequestAnimationFrame from '../_util/getRequestAnimationFrame';

const reqAnimFrame = getRequestAnimationFrame();

const easeInOutCubic = (t, b, c, d) => {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  } else {
    return cc / 2 * ((t -= 2) * t * t + 2) + b;
  }
};

function noop() { }

function getDefaultTarget() {
  return window;
}



export default class BackTop extends React.Component {
  static defaultProps = {
    visibilityHeight: 400,
  };

  scrollEvent;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  getCurrentScrollTop = () => {
    const getTarget = this.props.target || getDefaultTarget;
    const targetNode = getTarget();
    if (targetNode === window) {
      return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    }
    return targetNode.scrollTop;
  }

  scrollToTop = (e) => {
    const scrollTop = this.getCurrentScrollTop();
    const startTime = Date.now();
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      this.setScrollTop(easeInOutCubic(time, scrollTop, 0, 450));
      if (time < 450) {
        reqAnimFrame(frameFunc);
      }
    };
    reqAnimFrame(frameFunc);
    (this.props.onClick || noop)(e);
  }

  setScrollTop(value) {
    const getTarget = this.props.target || getDefaultTarget;
    const targetNode = getTarget();
    if (targetNode === window) {
      document.body.scrollTop = value;
      document.documentElement.scrollTop = value;
    } else {
      (targetNode).scrollTop = value;
    }
  }

  handleScroll = () => {
    const { visibilityHeight, target = getDefaultTarget } = this.props;
    const scrollTop = getScroll(target(), true);
    this.setState({
      visible: scrollTop > (visibilityHeight),
    });
  }

  componentDidMount() {
    const getTarget = this.props.target || getDefaultTarget;
    this.scrollEvent = addEventListener(getTarget(), 'scroll', this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }

  render() {
    const { prefixCls = 'ant-back-top', className = '', children } = this.props;
    const classString = classNames(prefixCls, className);

    const defaultElement = (
      <div className={`${prefixCls}-content`}>
        <div className={`${prefixCls}-icon`} />
      </div>
    );
    // fix https://fb.me/react-unknown-prop
    const divProps = omit(this.props, [
      'prefixCls',
      'className',
      'children',
      'visibilityHeight',
    ]);
    const backTopBtn = this.state.visible ? (
      <div {...divProps} className={classString} onClick={this.scrollToTop}>
        {children || defaultElement}
      </div>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {backTopBtn}
      </Animate>
    );
  }
}

