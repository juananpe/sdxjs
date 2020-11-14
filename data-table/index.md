---
---

-   Many applications work with data tables (sometimes called <g key="data_frame">data frames</g>)
    -   Examples include R's [tidyverse][tidyverse] and [DataForge][data-forge]
    -   Fixed set of named columns, each holding a specific type of data
    -   Any number of rows
-   Key operations are the same as those in SQL: filter, select, summarize, join
-   Do some experiments to choose an implementation before writing lots of code

## What is the most efficient way to store a data table?

-   One approach is <g key="row_wise">row-wise</g>
    -   Array of <g key="heterogeneous">heterogeneous</g> rows
    -   In JavaScript, an array of objects
-   Another is <g key="column_wise">column-wise</g>
    -   Each named column stored as a <g key="homogeneous">homogeneous</g> array
    -   In JavaScript, an object whose members are all arrays of the same length
-   Construct one of each, try some operations, record times and memory use, see which is better
    -   Answer will probably depend on...things
-   Data never modified after it is created
    -   Allows us to recycle memory
-   Build a row-wise table with some number of columns
    -   Values are 0, 1, 2, 0, 1, 2, etc.

<%- include('/_inc/slice.html', {file: 'measurement.js', tag: 'build-rows'}) %>

-   Add filter with a callback function to select rows
    -   Should be fast, since we are recycling the rows
-   And select with a list of column labels
    -   Should be slow, since we are constructing one new object per row

<%- include('/_inc/slice.html', {file: 'measurement.js', tag: 'operate-rows'}) %>

-   Now do the same for column-wise storage
    -   Select should be fast, since we are just aliasing some columns
    -   Filter should be slow, since we are constructing multiple new arrays
    -   The parameters to the two functions are different from those to the row-wise functions

<%- include('/_inc/slice.html', {file: 'measurement.js', tag: 'cols'}) %>

-   Build a <g key="test_harness">test harness</g> to run both variants for data tables of some size
    -   Arbitrarily decide to keep half of the columns and one-third of the rows
    -   This choice will affect our decision about which is better
-   Also calculate relative performance based on ratio of filters to selects
    -   Should also be based on data from whatever application we're trying to support

<%- include('/_inc/slice.html', {file: 'measurement.js', tag: 'main'}) %>

-   Actual measurement functions
    -   Use [microtime][microtime] to get micro-second level timing (since JavaScript's `Date` is only millisecond-level)
    -   Use [object-sizeof][object-sizeof] to estimate memory
    -   Also call `process.memoryUsage()` and look at `heapUsed`, but that value may be affected by garbage collection

<%- include('/_inc/slice.html', {file: 'measurement.js', tag: 'measure'}) %>

-   Run for a table 100 rows by 3 columns with a 3-1 ratio of filter to select

<%- include('/_inc/multi.html', {pat: 'measurement-100-03-03.*', fill: 'sh txt'}) %>

-   10,000 rows by 30 columns with the same 3-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'measurement-10000-30-03.txt'}) %>

-   Same large table with a 10-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'measurement-10000-30-10.txt'}) %>

-   Conclusion: column-wise is better
    -   Uses less memory (presumably because labels aren't duplicated)
    -   Cost of constructing new objects when doing select with row-wise storage
        outweighs cost of appending to arrays when doing filter with column-wise storage
-   Unfortunately makes the code itself a little more complicated to write
    -   A cost that doesn't show up in experiments