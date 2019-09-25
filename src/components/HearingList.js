/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import {Nav, NavItem, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col, Label} from 'react-bootstrap';
import {FormattedMessage, intlShape} from 'react-intl';
import Link from './LinkWithLang';
import FormatRelativeTime from '../utils/FormatRelativeTime';
import Icon from '../utils/Icon';
import {getHearingURL, isPublic} from '../utils/hearing';
import LabelList from './LabelList';
import LoadSpinner from './LoadSpinner';
import getAttr from '../utils/getAttr';
import HearingsSearch from './HearingsSearch';
import config from '../config';
import OverviewMap from '../components/OverviewMap';
import {keys, capitalize} from 'lodash';
import { Waypoint } from 'react-waypoint';
import Helmet from 'react-helmet';
import isEmpty from 'lodash/isEmpty';

import {labelShape} from '../types';

// eslint-disable-next-line import/no-unresolved
import defaultImage from '@city-images/default-image.svg';

const HEARING_LIST_TABS = {
  LIST: 'list',
  MAP: 'map',
};

const HearingListTabs = ({activeTab, changeTab}) => (
  <Row>
    <Col md={8} mdPush={2}>
      <Nav className="hearing-list__tabs" bsStyle="tabs" activeKey={activeTab}>
        {keys(HEARING_LIST_TABS).map(key => {
          const value = HEARING_LIST_TABS[key];
          return (
            <NavItem key={key} eventKey={value} title={capitalize(value)} onClick={() => changeTab(value)}>
              <FormattedMessage id={value} />
            </NavItem>
          );
        })}
      </Nav>
    </Col>
  </Row>
);

HearingListTabs.propTypes = {
  activeTab: PropTypes.string,
  changeTab: PropTypes.func,
};

const HearingListFilters = ({handleSort, formatMessage}) => (
  <div className="hearing-list__filter-bar clearfix">
    <FormGroup controlId="formControlsSelect" className="hearing-list__filter-bar-filter">
      <ControlLabel className="hearing-list__filter-bar-label">
        <FormattedMessage id="sort" />
      </ControlLabel>
      <FormControl
        className="select"
        componentClass="select"
        placeholder="select"
        onChange={event => handleSort(event.target.value)}
      >
        <option value="-created_at">{formatMessage({id: 'newestFirst'})}</option>
        <option value="created_at">{formatMessage({id: 'oldestFirst'})}</option>
        <option value="-close_at">{formatMessage({id: 'lastClosing'})}</option>
        <option value="close_at">{formatMessage({id: 'firstClosing'})}</option>
        <option value="-open_at">{formatMessage({id: 'lastOpen'})}</option>
        <option value="open_at">{formatMessage({id: 'firstOpen'})}</option>
        <option value="-n_comments">{formatMessage({id: 'mostCommented'})}</option>
        <option value="n_comments">{formatMessage({id: 'leastCommented'})}</option>
      </FormControl>
    </FormGroup>
  </div>
);

HearingListFilters.propTypes = {
  handleSort: PropTypes.func,
  formatMessage: PropTypes.func,
};

export class HearingListItem extends React.Component {
  render() {
    const hearing = this.props.hearing;
    const mainImage = hearing.main_image;
    let mainImageStyle = {
      backgroundImage: `url(${defaultImage})`,
    };
    if (hearing.main_image) {
      mainImageStyle = {
        backgroundImage: 'url("' + mainImage.url + '")',
      };
    }

    const {language} = this.props;
    const translationAvailable = !!getAttr(hearing.title, language, {exact: true});
    const availableInLanguageMessages = {
      fi: 'Kuuleminen saatavilla suomeksi',
      sv: 'Hörandet tillgängligt på svenska',
      en: 'Questionnaire available in English',
    };

    return (
      <div className="hearing-list-item" role="listitem">
        <Link to={{ path: getHearingURL(hearing) }} className="hearing-list-item-image" style={mainImageStyle}>
          <div aria-labelledby={hearing.id} />
        </Link>
        <div className="hearing-list-item-content">
          <div className="hearing-list-item-title-wrap">
            <h2 className="h4 hearing-list-item-title" id={hearing.id}>
              <Link to={{path: getHearingURL(hearing)}}>
                {!isPublic(hearing) ? (
                  <FormattedMessage id="hearingListNotPublished">
                    {(label) => <Icon name="eye-slash" aria-label={label} />}
                  </FormattedMessage>
                ) : null}{' '}
                {getAttr(hearing.title, language)}
              </Link>
            </h2>
            <div className="hearing-list-item-comments">
              <Icon name="comment-o" aria-hidden="true" />&nbsp;{hearing.n_comments}
              <span className="sr-only">
                {hearing.n_comments === 1 ? (
                  <FormattedMessage id="hearingListComment" />
                ) : <FormattedMessage id="hearingListComments" />}
              </span>
            </div>
          </div>
          <div className="hearing-list-item-times">
            <div>
              <FormatRelativeTime messagePrefix="timeOpen" timeVal={hearing.open_at} />
            </div>
            <div>
              <FormatRelativeTime messagePrefix="timeClose" timeVal={hearing.close_at} />
            </div>
          </div>
          <div className="hearing-list-item-labels clearfix">
            <LabelList labels={hearing.labels} className="hearing-list-item-labellist" language={language} />
            {hearing.closed ? (
              <div className="hearing-list-item-closed">
                <Label>
                  <FormattedMessage id="hearingClosed" />
                </Label>
              </div>
            ) : null}
          </div>
          {!translationAvailable && (
            <div className="hearing-card-notice">
              <Icon name="exclamation-circle" aria-hidden="true" />
              <FormattedMessage id="hearingTranslationNotAvailable" />
              {config.languages.map(
                lang =>
                  (getAttr(hearing.title, lang, { exact: true }) ? (
                    <div key={lang} className="language-available-message">
                      {availableInLanguageMessages[lang]}
                    </div>
                  ) : null)
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

HearingListItem.propTypes = {
  hearing: PropTypes.object,
  language: PropTypes.string,
};

export const HearingList = ({
  handleSearch,
  handleSelectLabels,
  handleSort,
  hearings,
  intl: {formatMessage},
  isLoading,
  isMobile,
  labels,
  language,
  onTabChange,
  searchPhrase,
  selectedLabels,
  showOnlyOpen,
  tab: activeTab,
  toggleShowOnlyOpen,
  handleReachBottom,
  intl
}) => {
  const hearingsToShow = !showOnlyOpen ? hearings : hearings.filter(hearing => !hearing.closed);
  const hasHearings = !isEmpty(hearings);

  const hearingListMap = hearingsToShow ? (
    <Row>
      <Col xs={12}>
        <Helmet title={formatMessage({ id: 'mapView' })} />
        <div className="hearing-list-map map">
          <Checkbox inline readOnly checked={showOnlyOpen} onChange={toggleShowOnlyOpen} style={{marginBottom: 10}}>
            <FormattedMessage id="showOnlyOpen" />
          </Checkbox>
          <OverviewMap
            hearings={hearingsToShow}
            style={{width: '100%', height: isMobile ? '100%' : 600}}
            enablePopups
          />
        </div>
      </Col>
    </Row>
  ) : null;

  return (
    <div>
      <section className="page-section--hearings-search">
        <div className="container">
          <Row>
            <Col md={10} mdPush={1}>
              <HearingsSearch
                handleSearch={handleSearch}
                handleSelectLabels={handleSelectLabels}
                labels={labels}
                language={language}
                searchPhrase={searchPhrase}
                selectedLabels={selectedLabels}
                intl={intl}
              />
            </Col>
          </Row>
        </div>
      </section>
      <section className="page-section--hearings-tabs">
        <div className="container">
          <HearingListTabs activeTab={activeTab} changeTab={onTabChange} />
        </div>
      </section>
      <section className="page-section page-section--hearings-list" id="hearings-section">
        <a href="#hearings-search-form" className="sr-only">
          <FormattedMessage id="jumpToSearchForm" />
        </a>
        <div className="container">
          {!isLoading && !hasHearings ? (
            <Row>
              <Col md={8} mdPush={2}>
                <p>
                  <FormattedMessage id="noHearings" />
                </p>
              </Col>
            </Row>
          ) : null}
          {hasHearings && activeTab === 'list' ? (
            <Row>
              <Col md={8} mdPush={2}>
                <div className="hearing-list">
                  <HearingListFilters handleSort={handleSort} formatMessage={formatMessage} />
                  <div role="list">
                    {hearings.map(hearing => (
                      <HearingListItem hearing={hearing} key={hearing.id} language={language} />
                    ))}
                  </div>
                  {isLoading && <LoadSpinner />}
                  {!isLoading && <Waypoint onEnter={handleReachBottom} />}
                </div>
              </Col>
            </Row>
          ) : null}
          {hasHearings && activeTab === 'map' && !isLoading ? hearingListMap : null}
        </div>
      </section>
    </div>
  );
};

HearingList.propTypes = {
  handleSearch: PropTypes.func,
  handleSelectLabels: PropTypes.func,
  handleSort: PropTypes.func,
  hearings: PropTypes.array,
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool,
  isMobile: PropTypes.bool,
  labels: PropTypes.arrayOf(labelShape),
  language: PropTypes.string,
  onTabChange: PropTypes.func,
  searchPhrase: PropTypes.string,
  selectedLabels: PropTypes.arrayOf(PropTypes.string),
  showOnlyOpen: PropTypes.bool,
  tab: PropTypes.string,
  toggleShowOnlyOpen: PropTypes.func,
  handleReachBottom: PropTypes.func,
};

HearingList.defaultProps = {
  tab: HEARING_LIST_TABS.LIST,
};

export default HearingList;
