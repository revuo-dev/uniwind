import {
    ScrollViewProps,
    ScrollViewPropsAndroid,
    ScrollViewPropsIOS,
    Touchable,
    VirtualizedListProps,
} from 'react-native'

declare module '@react-native/virtualized-lists' {
    export interface VirtualizedListWithoutRenderItemProps<ItemT> extends ScrollViewProps {
        ListFooterComponentClassName?: string
        ListHeaderComponentClassName?: string
    }
}

declare module 'react-native' {
    interface FlatListProps<ItemT> extends VirtualizedListProps<ItemT> {
        columnWrapperClassName?: string
    }

    interface ImageBackgroundProps extends ImagePropsBase {
        imageClassName?: string
    }

    interface ImagePropsBase {
        className?: string
    }

    interface InputAccessoryViewProps {
        className?: string
    }

    interface KeyboardAvoidingViewProps extends ViewProps {
        contentContainerClassName?: string
    }

    interface ScrollViewProps extends ViewProps, ScrollViewPropsIOS, ScrollViewPropsAndroid, Touchable {
        contentContainerClassName?: string
    }

    interface SwitchProps {
        className?: string
    }

    interface TextProps {
        className?: string
    }

    interface TouchableWithoutFeedbackProps {
        className?: string
    }

    interface ViewProps {
        className?: string
    }
}
