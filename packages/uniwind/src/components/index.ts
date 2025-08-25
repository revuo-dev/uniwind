import {
    ActivityIndicator as RNActivityIndicator,
    Animated as RNAnimated,
    FlatList as RNFlatList,
    Image as RNImage,
    ImageBackground as RNImageBackground,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
    Modal as RNModal,
    Pressable as RNPressable,
    RefreshControl as RNRefreshControl,
    ScrollView as RNScrollView,
    SectionList as RNSectionList,
    Switch as RNSwitch,
    Text as RNText,
    TextInput as RNTextInput,
    TouchableHighlight as RNTouchableHighlight,
    TouchableOpacity as RNTouchableOpacity,
    TouchableWithoutFeedback as RNTouchableWithoutFeedback,
    View as RNView,
    VirtualizedList as RNVirtualizedList,
} from 'react-native'
import { createUniwindComponent } from './rn'

export const ActivityIndicator = createUniwindComponent(RNActivityIndicator)
export const View = createUniwindComponent(RNView)
export const Text = createUniwindComponent(RNText)
export const Image = createUniwindComponent(RNImage)
export const ImageBackground = createUniwindComponent(RNImageBackground, ['imageStyle'])
export const KeyboardAvoidingView = createUniwindComponent(RNKeyboardAvoidingView, ['contentContainerStyle'])
export const Pressable = createUniwindComponent(RNPressable)
export const ScrollView = createUniwindComponent(RNScrollView, ['contentContainerStyle'])
export const FlatList = createUniwindComponent(RNFlatList, ['columnWrapperStyle'])
export const SectionList = createUniwindComponent(RNSectionList)
export const Switch = createUniwindComponent(RNSwitch)
export const TextInput = createUniwindComponent(RNTextInput)
export const RefreshControl = createUniwindComponent(RNRefreshControl)
export const TouchableHighlight = createUniwindComponent(RNTouchableHighlight)
export const TouchableOpacity = createUniwindComponent(RNTouchableOpacity)
export const VirtualizedList = createUniwindComponent(RNVirtualizedList, ['ListFooterComponentStyle', 'ListHeaderComponentStyle'])
export const Modal = createUniwindComponent(RNModal)
export const TouchableWithoutFeedback = createUniwindComponent(RNTouchableWithoutFeedback)
export const Animated = {
    ...RNAnimated,
    View: RNAnimated.createAnimatedComponent(View),
    Text: RNAnimated.createAnimatedComponent(Text),
    FlatList: RNAnimated.createAnimatedComponent(FlatList),
    Image: RNAnimated.createAnimatedComponent(Image),
    ScrollView: RNAnimated.createAnimatedComponent(ScrollView),
    SectionList: RNAnimated.createAnimatedComponent(SectionList),
}
