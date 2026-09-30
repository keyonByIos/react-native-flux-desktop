/** Component-level token overrides. Each extends the alias tokens it needs. */
export interface ButtonComponentToken {
    /** Default control border radius for buttons. */
    borderRadius: number;
    fontWeight: number;
    /** Horizontal padding for the default size. */
    paddingInline: number;
    paddingBlock: number;
    /** Height of the default / lg / sm / xs buttons. */
    contentFontSize: number;
    contentFontSizeSM: number;
    contentFontSizeLG: number;
    controlHeightSM: number;
    controlHeightLG: number;
    /** Danger / solid text color (usually white). */
    solidTextColor: string;
    defaultBorderColor: string;
    defaultColor: string;
    defaultBg: string;
}
export interface InputComponentToken {
    borderRadius: number;
    paddingInline: number;
    paddingBlock: number;
    controlHeight: number;
    activeBorderColor: string;
    hoverBorderColor: string;
    activeBg: string;
    colorFillAlertDialogBg: string;
}
export interface SwitchComponentToken {
    minLineWidth: number;
    innerMinMargin: number;
    handleSize: number;
    color: string;
    handleBg: string;
    loadingBg: string;
}
export interface TagComponentToken {
    borderRadiusSM: number;
    defaultBg: string;
    defaultColor: string;
    borderStyle: 'solid' | 'dashed';
}
export interface AvatarComponentToken {
    containerSize: number;
    containerSizeLG: number;
    containerSizeSM: number;
    borderRadius: number;
    textFontSize: number;
    textFontSizeLG: number;
    textFontSizeSM: number;
}
export interface BadgeComponentToken {
    indicatorHeight: number;
    indicatorHeightSM: number;
    dotSize: number;
    textFontSize: number;
    colorErrorShadow: string;
}
export interface CardComponentToken {
    borderRadiusLG: number;
    paddingLG: number;
    headerBg: string;
    headerFontSize: number;
    actionsBg: string;
}
export interface CheckboxComponentToken {
    borderRadiusSM: number;
    controlInteractiveSize: number;
    colorPrimary: string;
}
export interface CellComponentToken {
    paddingBlock: number;
    paddingInline: number;
    fontSizeDesc: number;
    descriptionColor: string;
    activeBg: string;
}
export interface SegmentedComponentToken {
    borderRadius: number;
    trackBg: string;
    thumbBg: string;
    itemPaddingBlock: number;
}
export interface RadioComponentToken {
    dotSize: number;
    size: number;
    colorPrimary: string;
}
export interface StepperComponentToken {
    buttonWidth: number;
    inputWidth: number;
    height: number;
    borderRadius: number;
    inputBg: string;
}
export interface SearchBarComponentToken {
    borderRadius: number;
    paddingInline: number;
    height: number;
    background: string;
}
export interface NoticeBarComponentToken {
    borderRadius: number;
    paddingInline: number;
    textColor: string;
    closableColor: string;
}
export interface ProgressComponentToken {
    lineSize: number;
    lineSizeSM: number;
    lineSizeLG: number;
    lineTrackSize: number;
    circleSize: number;
    remainingColor: string;
    innerFontSize: number;
}
export interface EmptyComponentToken {
    color: string;
    fontSize: number;
}
export interface ResultComponentToken {
    iconFontSize: number;
    titleFontSize: number;
    subtitleFontSize: number;
}
export interface DescriptionsComponentToken {
    titleFontSize: number;
    itemPaddingBottom: number;
    labelColor: string;
    contentColor: string;
    /** bordered 表格态：label 格填充底 / 单格内边距 / 外框圆角 */
    labelBg: string;
    cellPaddingInline: number;
    cellPaddingBlock: number;
    borderRadius: number;
}
export interface TimelineComponentToken {
    widthSM: number;
    fontSize: number;
}
export interface StepsComponentToken {
    iconFontSize: number;
    titleFontSize: number;
    /** 步骤圆点直径（default） */
    iconSize: number;
    /** 步骤圆点直径（small） */
    iconSizeSM: number;
}
export interface StatisticComponentToken {
    titleFontSize: number;
    contentFontSize: number;
}
export interface SkeletonComponentToken {
    borderRadius: number;
    gradientFromColor: string;
    gradientToColor: string;
}
export interface MenuComponentToken {
    /** 菜单项行高 */
    itemHeight: number;
    /** 菜单项左右内边距 */
    itemPaddingInline: number;
    /** 高亮块与容器两侧的间距（圆角高亮的左右缩进） */
    itemMarginInline: number;
    /** 图标与文字间距 */
    iconMarginInlineEnd: number;
    /** 图标尺寸 */
    iconSize: number;
    /** 菜单项字号 */
    itemFontSize: number;
    /** 每多一层子菜单的左缩进 */
    inlineIndent: number;
    /** 高亮块圆角 */
    itemBorderRadius: number;
    /** 子菜单展开箭头尺寸 */
    expandIconSize: number;
    /** 分组标题字号 / 行高 */
    groupTitleFontSize: number;
    groupTitleHeight: number;
    darkBg: string;
    darkItemColor: string;
    darkHoverBg: string;
    darkActiveBg: string;
    darkSelectedBg: string;
    darkSelectedColor: string;
    darkGroupTitleColor: string;
    darkDivider: string;
}
export interface PopupComponentToken {
    borderRadiusLG: number;
    closeIconColor: string;
    maskAlpha: number;
}
export interface TabsComponentToken {
    /** 标签项内边距 */
    itemPaddingInline: number;
    itemPaddingBlock: number;
    /** 选中下划线（ink bar）粗细 */
    inkBarSize: number;
    /** 相邻标签间距 */
    horizontalItemGutter: number;
}
export interface AlertComponentToken {
    borderRadius: number;
    paddingBlock: number;
    paddingInline: number;
    withDescriptionPaddingBlock: number;
    withDescriptionPaddingInline: number;
}
export interface ModalComponentToken {
    borderRadiusLG: number;
    titleFontSize: number;
    actionHeight: number;
}
/** Registry mapping component name -> its token interface. */
export interface ComponentTokenMap {
    Button: {
        token: ButtonComponentToken;
    };
    Input: {
        token: InputComponentToken;
    };
    Switch: {
        token: SwitchComponentToken;
    };
    Tag: {
        token: TagComponentToken;
    };
    Avatar: {
        token: AvatarComponentToken;
    };
    Badge: {
        token: BadgeComponentToken;
    };
    Card: {
        token: CardComponentToken;
    };
    Checkbox: {
        token: CheckboxComponentToken;
    };
    Cell: {
        token: CellComponentToken;
    };
    Segmented: {
        token: SegmentedComponentToken;
    };
    Radio: {
        token: RadioComponentToken;
    };
    Stepper: {
        token: StepperComponentToken;
    };
    SearchBar: {
        token: SearchBarComponentToken;
    };
    NoticeBar: {
        token: NoticeBarComponentToken;
    };
    Progress: {
        token: ProgressComponentToken;
    };
    Empty: {
        token: EmptyComponentToken;
    };
    Result: {
        token: ResultComponentToken;
    };
    Descriptions: {
        token: DescriptionsComponentToken;
    };
    Timeline: {
        token: TimelineComponentToken;
    };
    Steps: {
        token: StepsComponentToken;
    };
    Statistic: {
        token: StatisticComponentToken;
    };
    Skeleton: {
        token: SkeletonComponentToken;
    };
    Menu: {
        token: MenuComponentToken;
    };
    Tabs: {
        token: TabsComponentToken;
    };
    Alert: {
        token: AlertComponentToken;
    };
    Popup: {
        token: PopupComponentToken;
    };
    Modal: {
        token: ModalComponentToken;
    };
}
export type ComponentName = keyof ComponentTokenMap;
