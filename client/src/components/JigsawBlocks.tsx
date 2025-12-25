import React, { type PropsWithChildren, type ReactNode } from 'react'
import './JigsawBlocks.css'

type BaseJigsawProps = PropsWithChildren<{
  color?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  className?: string
}>

/**
 * Starter Jigsaw Block
 * Can only connect downward (has bottom notch, no top notch)
 */
export function StarterJigsaw({
  children,
  color = '#4C97FF',
  onClick,
  className = '',
}: BaseJigsawProps): React.ReactElement {
  return (
    <div
      className={`jigsaw-block starter-jigsaw ${className}`}
      style={{ ['--block-color' as any]: color }}
      onClick={onClick}
    >
      <div className="jigsaw-content">{children}</div>
      <div className="jigsaw-connector bottom-connector"></div>
    </div>
  )
}

type AttributeJigsawProps = PropsWithChildren<
  BaseJigsawProps & {
    connectTop?: boolean
    connectRight?: boolean
    connectBottom?: boolean
    connectLeft?: boolean
  }
>

/**
 * Attribute Jigsaw Block
 * Can connect in any direction (has notches/tabs on all sides)
 */
export function AttributeJigsaw({
  children,
  color = '#FF8C1A',
  onClick,
  className = '',
  connectTop = true,
  connectRight = true,
  connectBottom = true,
  connectLeft = true,
}: AttributeJigsawProps): React.ReactElement {
  return (
    <div
      className={`jigsaw-block attribute-jigsaw ${className}`}
      style={{ ['--block-color' as any]: color }}
      onClick={onClick}
    >
      {connectTop && <div className="jigsaw-connector top-connector"></div>}
      <div className="jigsaw-content-wrapper">
        {connectLeft && <div className="jigsaw-connector left-connector"></div>}
        <div className="jigsaw-content">{children}</div>
        {connectRight && <div className="jigsaw-connector right-connector"></div>}
      </div>
      {connectBottom && <div className="jigsaw-connector bottom-connector"></div>}
    </div>
  )
}

type SubComponentJigsawProps = PropsWithChildren<
  BaseJigsawProps & {
    attributes?: ReactNode
    placeholder?: string
  }
>

/**
 * Sub Component Jigsaw Block
 * Container where attribute jigsaws can be placed inside
 */
export function SubComponentJigsaw({
  children,
  attributes,
  color = '#9966FF',
  onClick,
  className = '',
  placeholder = 'Drop attributes here...',
}: SubComponentJigsawProps): React.ReactElement {
  const hasAttributes =
    attributes && (Array.isArray(attributes) ? attributes.length > 0 : true)

  return (
    <div
      className={`jigsaw-block subcomponent-jigsaw ${className}`}
      style={{ ['--block-color' as any]: color }}
      onClick={onClick}
    >
      <div className="jigsaw-content">
        <div className="subcomponent-header">{children}</div>
        <div className="subcomponent-slot">
          {hasAttributes ? (
            attributes
          ) : (
            <div className="subcomponent-placeholder">{placeholder}</div>
          )}
        </div>
      </div>
      <div className="jigsaw-connector bottom-connector"></div>
    </div>
  )
}







