# Typography

Various components related to text layout and appearance.

## BodyText

The `<BodyText>` component is a [styled component][styled-components], which applies text styling intended to make reading more comfortable in larger spans of text. It does _not_ restrict its own dimensions in any way; it only affects text. By default it renders a `<div>`.

### Props

| Name | Type | Default | Description |
| `underlineLinks` | boolean | `false` | If true, links (anchor tags, `<a>`) are always drawn with a text underline. This can make links easier to distinguish in long text paragraphs. However, it also makes it harder to distinguish between links and deliberately underlined text, so may not be advisable for user-generated rich text content. |

All other props are forwarded to the [styled component][styled-components].

[styled-components]: https://www.styled-components.com/
