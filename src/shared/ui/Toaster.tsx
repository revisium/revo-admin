import { Box, createToaster, Text, Toaster as ChakraToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-end',
})

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => (
      <Box
        bg="bg.2"
        borderWidth="1px"
        borderColor="border.warmStrong"
        borderRadius="warmCard"
        px="4"
        py="3"
        boxShadow="sh-3"
      >
        <Text textStyle="medium-sm" color="fg.0">
          {toast.title}
        </Text>
        {toast.description ? (
          <Text textStyle="regular-xs" color="fg.2">
            {toast.description}
          </Text>
        ) : null}
      </Box>
    )}
  </ChakraToaster>
)
