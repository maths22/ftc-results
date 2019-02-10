
import React, {Component} from 'react';

import ScrollLoop from 'react-scroll-loop';

export default class ScrollingBody extends Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {tooTall: false};
    this.scrollRef = React.createRef();
  }

  updateScroll() {
    const elem = this.scrollRef.current;
    const isTooTall = elem.getBoundingClientRect().bottom > elem.parentElement.getBoundingClientRect().bottom;
    if(this.state.tooTall != isTooTall) {
      this.setState({tooTall: isTooTall});
    }

  }

  componentDidMount() {
    this.updateScroll();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.updateScroll();
  }

  render () {
    const Wrapper = this.state.tooTall ? ScrollLoop : 'div';
    return <div ref={this.scrollRef}><Wrapper height="100%" >
      {this.props.children}
    </Wrapper></div>;
  }
}