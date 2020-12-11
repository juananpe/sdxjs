import {
  WrappedBlock,
  WrappedCol,
  WrappedRow
} from './wrapped.js'

export class DomBlock extends WrappedBlock {
  constructor (lines) {
    super(
      Math.max(...lines.split('\n').map(line => line.length)),
      lines.length
    )
    this.lines = lines
    this.tag = 'text'
  }
}

export class DomCol extends WrappedCol {
  constructor (attributes, ...children) {
    super(...children)
    this.attributes = attributes
    this.tag = 'col'
  }
}

export class DomRow extends WrappedRow {
  constructor (attributes, ...children) {
    super(0, ...children)
    this.attributes = attributes
    this.tag = 'row'
  }
}
