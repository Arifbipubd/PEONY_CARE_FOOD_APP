type LoginNavigation = {
  navigate: (...args: never[]) => void;
};

/** Opens the existing phone login flow from the public browse stack. */
export function openLogin(navigation: LoginNavigation) {
  (navigation.navigate as (name: string, params?: object) => void)('Auth', {
    screen: 'Login',
    initial: false,
  });
}
