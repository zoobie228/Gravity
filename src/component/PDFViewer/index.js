/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import { isEqual, throttle } from 'lodash';
import { IconButton, AddSubInput } from '@myss/common';
import styled from 'styled-components';

export default function PDFViewer(props) {
  const {
    url,
    containerWidth = 600,
    containerHeight = 600,
    document = {},
    page = {},
    pageSize = 10,
  } = props;

  const [numPages, setNumPages] = useState(null);
  const [pages, setPages] = useState([]);
  const [fixedScrollTop, setFixedScrollTop] = useState(0);
  const [pageInfo, setPageInfo] = useState([]);
  const [width, setWidth] = useState(containerWidth);
  const [showTools, setShowTools] = useState(false);
  const [from, setFrom] = useState(0);

  const start = useMemo(() => Math.max(0, Math.min(from, numPages)), [from, numPages]);
  const containerRef = useRef(null);
  const limit = useMemo(() => Math.min(numPages, pageSize), [numPages, pageSize]);
  const scrollbarWidth = 18;

  useEffect(() => {
    setShowTools(false);
    setPageInfo([]);
    setFrom(0);
  }, [url]);

  const onDocumentLoadSuccess = async pdf => {
    const { numPages } = pdf;

    let _pageInfo = [];
    for (let i = 1; i <= numPages; i++) {
      await pdf.getPage(i).then(page => {
        let [originalWidth, originalHeight] = [page._pageInfo.view[2], page._pageInfo.view[3]];
        if (page._pageInfo.rotate === 90) {
          [originalWidth, originalHeight] = [page._pageInfo.view[3], page._pageInfo.view[2]];
        }
        const scale = width / originalWidth;

        const height = Math.floor(originalHeight * scale);
        const info = { index: page.pageIndex, height, width, scale, originalHeight, originalWidth };
        _pageInfo = [..._pageInfo, info];
      });
    }
    setPageInfo(_pageInfo);
    setNumPages(numPages);
    setShowTools(true);
    const limit = Math.min(numPages, pageSize);
    setPages(indexArray(start - 1, start + limit - 1));
  };

  const scrollTo = (n, bool) => {
    setFrom(n);
    setPages(indexArray(n - 1, n + limit - 1));
    const top = getSpaceBefore(n - 1);
    setFixedScrollTop(top);
    bool && (containerRef.current.scrollTop = top);
  };

  const getSpaceBefore = useCallback(
    end => {
      let top = 0;
      if (end > 0) {
        for (let i = 0; i < end; i++) {
          top += pageInfo[i].height;
        }
      }

      return top;
    },
    [pageInfo],
  );

  const totalHeight = useMemo(() => {
    return getSpaceBefore(pageInfo.length);
  }, [getSpaceBefore, pageInfo.length]);

  const hasScrollbar = useMemo(() => totalHeight > containerHeight, [totalHeight, containerHeight]);
  const renderPage = indexArray => {
    return indexArray.map(
      d =>
        d >= 0 &&
        d < numPages && (
          <Page
            key={d}
            pageIndex={d}
            width={hasScrollbar ? width - scrollbarWidth : width}
            renderTextLayer={false}
            {...page}
          />
        ),
    );
  };

  const getPageIndex = useCallback(
    scrollTop => {
      let top = 0;
      for (let i = 0; i < pageInfo.length; i++) {
        top += pageInfo[i].height;
        if (top > scrollTop) {
          return i;
        }
      }
    },
    [pageInfo],
  );

  const onContainerScroll = e => {
    const { scrollTop } = e.target;
    const pageIndex = getPageIndex(scrollTop);
    const last = pageIndex + limit - 1;
    const indices = indexArray(pageIndex - 1, last);
    if (!isEqual(indices, pages)) {
      scrollTo(pageIndex);
    }
  };

  const handleMinusPlus = useCallback(
    width => {
      const _pageInfo = pageInfo.map(d => {
        return {
          ...d,
          width: width - scrollbarWidth,
          height: Math.floor((d.originalHeight * (width - scrollbarWidth)) / d.originalWidth),
        };
      });

      setWidth(width);
      setPageInfo(_pageInfo);
    },
    [pageInfo],
  );

  const onInputChange = num => {
    scrollTo(num, true);
  };

  return (
    <Wrapper>
      {showTools ? (
        <div className="tool-bars">
          <span className="add-sub-input">
            <AddSubInput value={1} onChange={onInputChange} min={1} max={numPages} />
            of {numPages}
          </span>
          <IconButton
            icon={'circle-minus'}
            onClick={() => handleMinusPlus(width - 100)}
            disabled={containerWidth >= width}
          />
          <IconButton icon={'circle-plus'} onClick={() => handleMinusPlus(width + 100)} />
        </div>
      ) : (
        <div className="tool-bars fix" />
      )}
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          position: 'relative',
          overflow: 'auto',
        }}
        ref={containerRef}
        onScroll={throttle(onContainerScroll, 16)}
      >
        <div style={{ height: totalHeight }}>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="loading">Loading PDF...</div>}
            {...document}
          >
            <div className="pdf-container">
              <div
                style={{
                  position: 'absolute',
                  transform: `translate3d(0,${fixedScrollTop}px,0)`,
                }}
              >
                {numPages && renderPage(pages)}
              </div>
            </div>
          </Document>
        </div>
      </div>
    </Wrapper>
  );
}
function indexArray(start, end) {
  const x = [];
  for (let i = 0; i < end - start + 1; i++) {
    x.push(start + i);
  }
  return x;
}

const Wrapper = styled.div`
  position: relative;
  .tool-bars {
    position: relative;
    height: 37px;
    z-index: 1;
    background-color: transparent;
    transition: opacity 1s;
    text-align: right;
    border-bottom: 1px solid #cdcdcd;
  }
  .tool-bars.fix {
    height: 38px;
    border: 0;
  }
  .pdf-container {
    position: relative;
    /* overflow: hidden; */
    width: 100%;
    height: 100%;
  }
  .loading {
    text-align: center;
    margin-top: 100;
  }
  .add-sub-input {
    display: inline-block;
    height: 20px;
    margin-right: 10px;
    div {
      display: inline-block;
      span {
        margin-left: 5px !important;
      }
    }
  }
  .add-sub-input .add-sub-button {
    display: none;
  }
  svg {
    stroke-width: 1;
    fill: #464646;
    stroke: #464646;
  }
  .design2-button-default[disabled]:hover,
  .design2-button[disabled]:hover {
    background-color: transparent;
  }
  .design2-button-default:focus,
  .design2-button-default:focus svg,
  .design2-button-default:active,
  .design2-button-default:active svg {
    color: #464646;
    fill: #464646;
    stroke: #464646;
    stroke-width: 1;
  }
  .design2-button-default,
  .design2-button-default:active,
  .design2-button-default:focus {
    background-color: transparent;
  }
`;
